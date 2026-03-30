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

// Alias for /history to support frontend call to /consultations
router.get('/consultations', authMiddleware, async (req, res) => {
  try {
    const all = getConsultations()
    const consultations = all
      .filter((c) => c.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ consultations })
  } catch (err) {
    console.error('Consultations error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Download consultation history as CSV
router.get('/consultations/download/csv', authMiddleware, async (req, res) => {
  try {
    const all = getConsultations()
    const userConsultations = all
      .filter((c) => c.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    if (userConsultations.length === 0) {
      return res.status(400).json({ error: 'No consultations to download' })
    }

    // Create CSV content
    const headers = ['Date', 'Time', 'Message', 'Reply']
    const rows = userConsultations.map((c) => {
      const date = new Date(c.created_at)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        `"${(c.message || '').replace(/"/g, '""')}"`,
        `"${(c.reply || '').replace(/"/g, '""')}"`
      ]
    })

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="consultation-history-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csv)
  } catch (err) {
    console.error('Download error:', err)
    res.status(500).json({ error: 'Failed to generate download' })
  }
})

// Download consultation history as JSON
router.get('/consultations/download/json', authMiddleware, async (req, res) => {
  try {
    const all = getConsultations()
    const userConsultations = all
      .filter((c) => c.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    if (userConsultations.length === 0) {
      return res.status(400).json({ error: 'No consultations to download' })
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="consultation-history-${new Date().toISOString().split('T')[0]}.json"`)
    res.json(userConsultations)
  } catch (err) {
    console.error('Download error:', err)
    res.status(500).json({ error: 'Failed to generate download' })
  }
})

module.exports = router
