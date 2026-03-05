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
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${mlUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    })
    
    if (!response.ok) {
      return res.status(503).json({ error: 'ML service unavailable' })
    }
    
    const data = await response.json()
    
    // Save consultation to database (only if user explicitly requests diagnosis)
    if (req.body.saveConsult !== false) {
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
    }
    
    // Return both disease and confidence (confidence is internal use only)
    res.json({ 
      disease: data.disease,
      confidence: data.confidence 
    })
  } catch (err) {
    console.error('Predict error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
