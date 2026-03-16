const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getConsultations } = require('../db')

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const all = getConsultations()
    const consultations = all
      .filter((c) => c.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ consultations })
  } catch (err) {
    console.error('History error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
