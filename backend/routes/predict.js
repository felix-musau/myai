const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { Low, JSONFile } = require('lowdb')
const path = require('path')

router.post('/predict', authMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms required' })
    }
    
    // Call Python ML service
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    })
    
    if (!response.ok) {
      return res.status(503).json({ error: 'ML service unavailable' })
    }
    
    const data = await response.json()
    
    // Save consultation to database
    const consultFile = path.join(__dirname, '..', 'db', 'consultations.json')
    const adapter = new JSONFile(consultFile)
    const db = new Low(adapter)
    await db.read()
    db.data = db.data || { consultations: [] }
    
    db.data.consultations.push({
      id: Date.now(),
      user_id: req.user.id,
      username: req.user.username,
      symptoms,
      disease: data.disease,
      created_at: new Date().toISOString()
    })
    await db.write()
    
    res.json({ disease: data.disease })
  } catch (err) {
    console.error('Predict error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
