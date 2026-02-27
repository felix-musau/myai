const express = require('express')
const router = express.Router()
const { register, login, logout, checkAuth, forgotPassword, resetPassword } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/logout', logout)
router.get('/check', checkAuth)

module.exports = router
