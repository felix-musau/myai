const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
  getUsers,
  saveUsers,
  getNextId
} = require('../db')

// token blacklist (logged out tokens) kept in memory
let tokenBlacklist = new Set()
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
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase())
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

    const users = getUsers()
    const existing = users.find((u) => u.username === username || u.email === email)
    if (existing) {
      console.log('⚠️ Registration blocked, user exists')
      return res.status(400).json({ error: 'User exists' })
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10
    const hash = await bcrypt.hash(password, rounds)

    const newUser = {
      id: getNextId(users),
      username,
      email,
      password_hash: hash,
      is_verified: true,
      created_at: new Date().toISOString()
    }

    users.push(newUser)
    saveUsers(users)

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

    const users = getUsers()
    const user = users.find((u) => u.username === identifier || u.email === identifier)

    if (!user) {
      console.log('👤 User not found:', identifier)
      return res.status(400).json({ error: 'Invalid credentials' })
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

    const users = getUsers()
    const user = users.find((u) => u.email === email)
    if (!user) {
      // Always return success to avoid leaking which emails exist
      return res.json({ message: 'If an account exists, a password reset link has been sent.' })
    }

    const token = generateRandomToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    user.password_reset_token = token
    user.password_reset_expires = expiresAt
    saveUsers(users)

    // In production, you would send an email with a reset link.
    // For now, we return the token so it can be used in the frontend flow.
    return res.json({
      message: 'Password reset token created. Use it to reset your password.',
      resetToken: token
    })
  } catch (err) {
    console.error('forgotPassword error', err)
    return res.status(500).json({ error: 'Failed to create reset token' })
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    const users = getUsers()
    const user = users.find((u) => u.password_reset_token === token)
    if (!user || !user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token is invalid or expired' })
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10
    const hash = await bcrypt.hash(password, rounds)

    user.password_hash = hash
    delete user.password_reset_token
    delete user.password_reset_expires
    saveUsers(users)

    return res.json({ message: 'Password has been reset successfully' })
  } catch (err) {
    console.error('resetPassword error', err)
    return res.status(500).json({ error: 'Failed to reset password' })
  }
}

module.exports = {
  register,
  login,
  logout,
  checkAuth,
  forgotPassword,
  resetPassword,
  isTokenInvalidated,
  tokenBlacklist
}
