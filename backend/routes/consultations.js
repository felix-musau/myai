const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const pool = require('../db')

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, symptoms, predicted_disease, confidence, created_at FROM consultations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ consultations: rows })
  } catch (err) {
    console.error('History error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
