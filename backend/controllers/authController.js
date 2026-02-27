const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { Low, JSONFile } = require('lowdb')
const path = require('path')

const dbFile = path.join(__dirname, '..', 'db', 'users.json')
const adapter = new JSONFile(dbFile)
const db = new Low(adapter)

async function ensureDB(){
  await db.read()
  db.data = db.data || { users: [] }
  await db.write()
}


async function register(req, res){
  try {
    console.log('📝 Register attempt (email verification disabled):', { username: req.body.username, email: req.body.email })
    await ensureDB()
    const { username, email, password } = req.body
    if(!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }
    const exists = db.data.users.find(u => u.username === username || u.email === email)
    if(exists) {
      return res.status(400).json({ error: 'User exists' })
    }
    const hash = await bcrypt.hash(password, 10)
    const user = { id: Date.now(), username, email, password_hash: hash, is_verified: true }
    db.data.users.push(user)
    await db.write()
    // auto-login by issuing token
    const loginToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' })
    res.cookie('token', loginToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7*24*60*60*1000 })
    return res.json({ message: 'Registered successfully', username: user.username, email: user.email })
  } catch(err) {
    console.error('❌ Register error:', err)
    return res.status(500).json({ error: 'Registration failed: ' + err.message })
  }
}


async function login(req, res){
  await ensureDB()
  const { username, password } = req.body
  const user = db.data.users.find(u => u.username === username)
  if(!user) return res.status(400).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if(!ok) return res.status(400).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' })
  // set httpOnly cookie
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7*24*60*60*1000 })
  return res.json({ message: 'Logged in', username: user.username, email: user.email, token })
}

async function logout(req, res){
  res.clearCookie('token')
  return res.json({ message: 'Logged out' })
}

async function checkAuth(req, res){
  try {
    const token = req.cookies.token
    if(!token) return res.json({ authenticated: false })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({ authenticated: true, username: payload.username })
  } catch(err) {
    return res.json({ authenticated: false })
  }
}

// forgot / reset password functions
async function sendResetEmail(toEmail, token){
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Reset your password',
    html: `<p>Click to reset your password: <a href="${resetUrl}">Reset Password</a></p><p>Or copy this URL: ${resetUrl}</p>`
  })
  return info
}


async function forgotPassword(req, res){
  const { email } = req.body
  if(!email) return res.status(400).json({ error: 'Email required' })
  await ensureDB()
  const user = db.data.users.find(u => u.email === email)
  if(!user) return res.status(404).json({ error: 'User not found' })
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' })
  try{
    await sendResetEmail(email, token)
    return res.json({ message: 'Password reset link sent' })
  }catch(err){
    console.error('reset email error', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}

async function resetPassword(req, res){
  const { token, password } = req.body
  if(!token || !password) return res.status(400).json({ error: 'Token and password required' })
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    await ensureDB()
    const user = db.data.users.find(u => u.email === payload.email)
    if(!user) return res.status(404).json({ error: 'User not found' })
    const hash = await bcrypt.hash(password, 10)
    user.password_hash = hash
    await db.write()
    return res.json({ message: 'Password updated' })
  }catch(err){
    return res.status(400).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { register, login, logout, checkAuth, forgotPassword, resetPassword }
