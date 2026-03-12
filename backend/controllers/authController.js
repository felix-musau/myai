const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');   // postgres connection

// token blacklist (logged out tokens) kept in memory
let tokenBlacklist = new Set();
function isTokenInvalidated(token) {
  return token && typeof token === 'string' && tokenBlacklist.has(token);
}

// ensure JWT secret exists
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
    console.log('📝 Register attempt:', req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // check for existing user
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (existing.length) {
      console.log('⚠️ Registration blocked, user exists');
      return res.status(400).json({ error: 'User exists' });
    }

    const rounds = process.env.NODE_ENV === 'production' ? 8 : 10;
    const hash = await bcrypt.hash(password, rounds);

    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id,username,email',
      [username, email, hash]
    );
    const user = rows[0];
    console.log('✅ New user created:', user.username);

    if (!checkSecret(res)) return;
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ message: 'Registered successfully', username: user.username, email: user.email });
  } catch (err) {
    console.error('❌ Register error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt for:', username);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id,username,email,password FROM users WHERE username=$1 OR email=$1',
      [username]
    );
    const user = rows[0];
    if (!user) {
      console.log('👤 User not found:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('🔒 Password mismatch for user:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!checkSecret(res)) return;
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ message: 'Login successful', username: user.username, email: user.email });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies.token;
    if (token) tokenBlacklist.add(token);
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
    if (!checkSecret(res)) return;
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
