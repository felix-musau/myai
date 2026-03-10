const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { Low, JSONFile } = require('lowdb')
const path = require('path')

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const consultFile = path.join(__dirname, '..', 'db', 'consultations.json')
    const adapter = new JSONFile(consultFile)
    const db = new Low(adapter)
    await db.read()
    
    const userConsults = (db.data?.consultations || []).filter(c => c.user_id === req.user.id)
    res.json(userConsults)
  } catch (err) {
    console.error('History error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
