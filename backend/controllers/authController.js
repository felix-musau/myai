const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const {
  getUsers,
  saveUsers,
  getNextId
} = require('../db')

// token blacklist (logged out tokens) kept in memory
let tokenBlacklist = new Set()

function getTransporter() {
  // SendGrid (Render-friendly)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      return {
        sendMail: async (options) => {
          const msg = {
            to: options.to,
            from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@myai.health',
            subject: options.subject,
            text: options.text,
            html: options.html
          }
          await sgMail.send(msg)
        }
      }
    } catch (err) {
      console.error('SendGrid init error:', err.message)
    }
  }
  
  // Fallback to nodemailer for local SMTP
  if (process.env.SMTP_HOST) {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
    const user = process.env.EMAIL_USER || process.env.SMTP_USER
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
    const secure = (process.env.EMAIL_SECURE === 'true') || false

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      })
    }
  }
  
  return null
}

async function sendVerificationEmail(email, token, expiresAt) {
  const transport = getTransporter()
  const fromAddress = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com'

  const subject = 'Verify your MyAI Healthcare account'
  const text = `Your verification code is: ${token}\nIt expires at ${expiresAt} (UTC).` +
    '\n\nIf you did not request this, ignore it.'
  const html = `<p>Your verification code is: <strong>${token}</strong></p><p>Expires at: ${expiresAt} UTC</p>`

  if (transport) {
    try {
      await transport.sendMail({
        from: fromAddress,
        to: email,
        subject,
        text,
        html
      })
      console.log(`✅ Verification email sent to ${email}`)
    } catch (err) {
      console.error(`⚠️ Email send failed for ${email}:`, err.message)
      console.log(`🔑 DEV FALLBACK - ${email} token: ${token} (expires ${expiresAt.toString().slice(0,19)} UTC)`)
    }
  } else {
    console.log(`🔑 DEV MODE - ${email} token: ${token} (expires ${expiresAt.toString().slice(0,19)} UTC)`)
  }
}

async function sendPasswordResetEmail(email, token, expiresAt, frontendUrl) {
  const transport = getTransporter()
  const fromAddress = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com'
  const resetLink = `${frontendUrl}/reset-password?token=${token}`

  const subject = 'Reset your MyAI Healthcare password'
  const text = `Click the link below to reset your password:\n${resetLink}\n\nThis link expires at ${expiresAt} (UTC).\n\nIf you did not request this, ignore it.`
  const html = `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires at: ${expiresAt} UTC</p>`

  if (transport) {
    try {
      await transport.sendMail({
        from: fromAddress,
        to: email,
        subject,
        text,
        html
      })
      console.log(`✅ Password reset email sent to ${email}`)
    } catch (err) {
      console.error(`⚠️ Failed to send password reset email to ${email}:`, err.message)
      // Log token for dev/fallback
      console.log(`📨 [FALLBACK] Password reset token for ${email}: ${token}\nReset link: ${resetLink}\nExpires: ${expiresAt}`)
    }
  } else {
    console.log(`📨 [DEV] Email sending not configured. Password reset token for ${email}: ${token}\nReset link: ${resetLink}\nExpires: ${expiresAt}`)
  }
}

function isTokenInvalidated(token) {
  return token && typeof token === 'string' && tokenBlacklist.has(token)
}

// ensure JWT secret exists
function checkSecret(res) {
  if (!process.env.JWT_SECRET) {
    const msg = 'JWT_SECRET is not defined'
    console.error('❌', msg)
    res.status(500).json({ error: msg })
    return false
  }
  return true
}

const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

function generateToken(user) {
  // Support admin flag from either env list or a database field (e.g. is_admin)
  const isAdminFromDb = user?.isAdmin || user?.is_admin || false
  const isAdminFromEnv = user?.email && adminEmails.includes(user.email.toLowerCase())
  const isAdmin = isAdminFromDb || isAdminFromEnv
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  )
}

async function register(req, res) {
  try {
    console.log('📝 Register attempt:', req.body)
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }

    const users = await getUsers()
    const existing = users.find((u) => u.username === username || u.email === email)
    if (existing) {
      console.log('⚠️ Registration blocked, user exists')
      return res.status(400).json({ error: 'User exists' })
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10
    const hash = await bcrypt.hash(password, rounds)

    const emailVerificationToken = generateRandomToken()
    const requireVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true'

    const verificationExpiry = new Date(Date.now() + 60 * 1000).toISOString() // 1 minute

    const newUser = {
      id: getNextId(users),
      username,
      email,
      password_hash: hash,
      is_verified: !requireVerification,
      email_verification_token: requireVerification ? emailVerificationToken : undefined,
      email_verification_expires: requireVerification ? verificationExpiry : undefined,
      created_at: new Date().toISOString()
    }

    users.push(newUser)
    await saveUsers(users)

    if (requireVerification) {
      try {
        await sendVerificationEmail(email, emailVerificationToken, verificationExpiry)
      } catch (err) {
        console.error('sendVerificationEmail error:', err.message)
      }

      return res.json({
        message: 'Registered successfully. Please verify your email with the code sent to your inbox.',
        emailVerificationToken: emailVerificationToken,
        emailVerificationExpires: verificationExpiry
      })
    }

    if (!checkSecret(res)) return
    const token = generateToken(newUser)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({
      message: 'Registered successfully',
      username: newUser.username,
      email: newUser.email,
      isAdmin: token && jwt.verify(token, process.env.JWT_SECRET).isAdmin
    })
  } catch (err) {
    console.error('❌ Register error:', err)
    return res.status(500).json({ error: 'Registration failed: ' + err.message })
  }
}

async function login(req, res) {
  try {
    const identifier = req.body.username || req.body.email
    const { password } = req.body
    console.log('🔐 Login attempt for:', identifier)
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' })
    }

    const users = await getUsers()
    const user = users.find((u) => u.username === identifier || u.email === identifier)

    if (!user) {
      console.log('👤 User not found:', identifier)
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    if (!user.is_verified) {
      console.log('⛔ Login attempt for unverified user:', identifier)
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      console.log('🔒 Password mismatch for user:', identifier)
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    if (!checkSecret(res)) return
    const token = generateToken(user)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({
      message: 'Login successful',
      username: user.username,
      email: user.email,
      isAdmin: token && jwt.verify(token, process.env.JWT_SECRET).isAdmin
    })
  } catch (err) {
    console.error('❌ Login error:', err)
    return res.status(500).json({ error: 'Login failed: ' + err.message })
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies.token
    if (token) tokenBlacklist.add(token)
  } catch (e) {
    console.error('logout blacklist error', e)
  }
  res.clearCookie('token')
  return res.json({ message: 'Logged out successfully' })
}

async function checkAuth(req, res) {
  try {
    const token = req.cookies.token
    if (!token || isTokenInvalidated(token)) {
      return res.json({ authenticated: false })
    }
    if (!checkSecret(res)) return
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({
      authenticated: true,
      username: payload.username,
      email: payload.email,
      isAdmin: payload.isAdmin || false
    })
  } catch (err) {
    console.error('checkAuth error', err)
    return res.json({ authenticated: false })
  }
}

function generateRandomToken() {
  return require('crypto').randomBytes(32).toString('hex')
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const users = await getUsers()
    const user = users.find((u) => u.email === email)
    if (!user) {
      // Always return success to avoid leaking which emails exist
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' })
    }

    const token = generateRandomToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    user.password_reset_token = token
    user.password_reset_expires = expiresAt
    await saveUsers(users)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    try {
      await sendPasswordResetEmail(email, token, expiresAt, frontendUrl)
    } catch (err) {
      console.error('sendPasswordResetEmail error:', err)
    }

    return res.json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    })
  } catch (err) {
    console.error('forgotPassword error', err)
    return res.status(500).json({ error: 'Failed to process password reset request' })
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    const users = await getUsers()
    const user = users.find((u) => u.password_reset_token === token)
    if (!user || !user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token is invalid or expired' })
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10
    const hash = await bcrypt.hash(password, rounds)

    user.password_hash = hash
    delete user.password_reset_token
    delete user.password_reset_expires
    await saveUsers(users)

    return res.json({ message: 'Password has been reset successfully' })
  } catch (err) {
    console.error('resetPassword error', err)
    return res.status(500).json({ error: 'Failed to reset password' })
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Verification token is required' })

    const users = await getUsers()
    const user = users.find((u) => u.email_verification_token === token)
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' })
    }

    if (!user.email_verification_expires || new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification token expired. Please request a new one.' })
    }

    user.is_verified = true
    delete user.email_verification_token
    delete user.email_verification_expires
    await saveUsers(users)

    return res.json({ message: 'Email verified successfully. You can now log in.' })
  } catch (err) {
    console.error('verifyEmail error', err)
    return res.status(500).json({ error: 'Failed to verify email' })
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' })
    }

    const users = await getUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const validCurrent = await bcrypt.compare(currentPassword, user.password_hash)
    if (!validCurrent) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10
    user.password_hash = await bcrypt.hash(newPassword, rounds)
    await saveUsers(users)

    return res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('changePassword error', err)
    return res.status(500).json({ error: 'Failed to change password' })
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body
    if (!email) { return res.status(400).json({ error: 'Email is required' }) }

    const users = await getUsers()
    const user = users.find((u) => u.email === email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'User already verified' })
    }

    const token = generateRandomToken()
    const expires = new Date(Date.now() + 60 * 1000).toISOString() // 1 minute

    user.email_verification_token = token
    user.email_verification_expires = expires
    await saveUsers(users)

    try {
      await sendVerificationEmail(email, token, expires)
    } catch (err) {
      console.error('sendVerificationEmail error:', err)
    }

    return res.json({ message: 'Verification token resent', emailVerificationToken: token, emailVerificationExpires: expires })
  } catch (err) {
    console.error('resendVerification error', err)
    return res.status(500).json({ error: 'Failed to resend verification token' })
  }
}

module.exports = {
  register,
  login,
  logout,
  checkAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  isTokenInvalidated,
  tokenBlacklist
}
