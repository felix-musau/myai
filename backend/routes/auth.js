const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const {
  register,
  login,
  logout,
  checkAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword
} = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendVerification)
router.post('/change-password', authMiddleware, changePassword)
router.post('/logout', logout)
router.get('/check', checkAuth)

module.exports = router
