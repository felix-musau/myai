const jwt = require('jsonwebtoken')
const { isTokenInvalidated } = require('../controllers/authController')

function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'No token' })
    if (isTokenInvalidated(token)) {
      return res.status(401).json({ error: 'Token has been invalidated' })
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = authMiddleware
