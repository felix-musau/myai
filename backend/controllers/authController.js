const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Low, JSONFile } = require('lowdb');
const path = require('path');

// Token blacklist for invalidated tokens (logged out users)
let tokenBlacklist = new Set();

// Helper function to check if token is blacklisted (logged out)
function isTokenInvalidated(token) {
  return token && typeof token === 'string' && tokenBlacklist.has(token);
}

const dbFile = path.join(__dirname, '..', 'db', 'users.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function ensureDB() {
  await db.read();
  db.data = db.data || { users: [] };
  await db.write();
}

// make sure JWT secret exists before signing/verifying
function checkSecret(res) {
  if (!process.env.JWT_SECRET) {
    const msg = 'JWT_SECRET is not defined';
    console.error('❌', msg);
    res.status(500).json({ error: msg });
    return false;
  }
  return true;
}

async function register(req, res) {
  try {
    console.log('📝 Register attempt:', { username: req.body.username, email: req.body.email });
    await ensureDB();
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      console.log('⚠️ Missing field in registration:', req.body);
      return res.status(400).json({ error: 'All fields required' });
    }
    const existsUser = db.data.users.find(u => u.username === username || u.email === email);
    if (existsUser) {
      console.log('⚠️ Registration blocked, user exists:', existsUser);
      return res.status(400).json({ error: 'User exists' });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const userObj = { id: Date.now(), username, email, password_hash: hashPassword, is_verified: true };
    db.data.users.push(userObj);
    await db.write();
    console.log('✅ New user created:', username);

    if (!checkSecret(res)) return;
    const loginToken = jwt.sign({ id: userObj.id, username: userObj.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
    res.cookie('token', loginToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7*24*60*60*1000 });
    return res.json({ message: 'Registered successfully', username: userObj.username, email: userObj.email });
  } catch (err) {
    console.error('❌ Register error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
}

async function login(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    return res.status(500).json({ error: 'Database error. Please try again later.' });
  }
  const { username, password } = req.body;
  console.log('🔐 Login attempt for:', username);
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = db.data.users.find(u => u.username === username);
  if (!user) {
    console.log('👤 User not found:', username);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  let ok = false;
  try {
    ok = await bcrypt.compare(password, user.password_hash);
  } catch (e) {
    console.error('bcrypt compare error', e);
    ok = false;
  }
  if (!ok) {
    console.log('🔒 Password mismatch for user:', username);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  if (!checkSecret(res)) return;
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7*24*60*60*1000 });
  return res.json({ message: 'Login successful', username: user.username, email: user.email });
}

async function logout(req, res) {
  try {
    const token = req.cookies.token;
    if (token) {
      tokenBlacklist.add(token);
    }
  } catch (e) {
    console.error('logout blacklist error', e);
  }
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
}

async function checkAuth(req, res) {
  try {
    const token = req.cookies.token;
    if (!token || isTokenInvalidated(token)) {
      return res.json({ authenticated: false });
    }
    if (!checkSecret(res)) return; // this will send response
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ authenticated: true, username: payload.username });
  } catch (err) {
    console.error('checkAuth error', err);
    return res.json({ authenticated: false });
  }
}

module.exports = {
  register,
  login,
  logout,
  checkAuth,
  isTokenInvalidated,
  tokenBlacklist
};
