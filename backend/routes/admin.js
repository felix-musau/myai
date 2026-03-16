const express = require('express')
const router = express.Router()
const { authMiddleware, adminMiddleware } = require('../middleware/admin')
const { getUsers, getConsultations, getDoctorRequests } = require('../db')

// List all users (admin only)
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = getUsers().slice().sort((a, b) => (b.id || 0) - (a.id || 0))
    res.json({ users })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: err.message })
  }
})

// List all consultations (admin only)
router.get('/admin/consultations', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const consultations = getConsultations().slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ consultations })
  } catch (err) {
    console.error('Admin consultations error:', err)
    res.status(500).json({ error: err.message })
  }
})

// List doctor requests (admin only)
router.get('/admin/doctor-requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requests = getDoctorRequests().slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ requests })
  } catch (err) {
    console.error('Admin doctor requests error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Metrics - counts per day for the last 7 days
router.get('/admin/metrics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date()
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dailyCounts = (items, dateKey = 'created_at') => {
      const counts = {}
      items.forEach((item) => {
        const d = new Date(item[dateKey])
        if (isNaN(d)) return
        if (d < since) return
        const day = d.toISOString().slice(0, 10)
        counts[day] = (counts[day] || 0) + 1
      })
      return Object.entries(counts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day))
    }

    const consultations = dailyCounts(getConsultations())
    const doctorRequests = dailyCounts(getDoctorRequests())
    const signups = dailyCounts(getUsers(), 'created_at')

    res.json({
      consultations,
      doctorRequests,
      signups
    })
  } catch (err) {
    console.error('Admin metrics error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
