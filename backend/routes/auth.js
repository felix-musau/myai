const express = require('express')
const router = express.Router()
const { register, login, logout, checkAuth } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
// password reset endpoints are not implemented
// router.post('/forgot-password', forgotPassword)
// router.post('/reset-password', resetPassword)
router.post('/logout', logout)
router.get('/check', checkAuth)

module.exports = router
