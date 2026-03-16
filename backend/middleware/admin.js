const authMiddleware = require('./auth')

function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware }
