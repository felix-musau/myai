const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getDoctorRequests, saveDoctorRequests, getNextId } = require('../db')

// POST /api/request-doctor
// Records request in JSON file and returns a mock response
router.post('/request-doctor', authMiddleware, async (req, res) => {
  const {
    fullName,
    email,
    phone,
    symptoms,
    preferredDate,
    preferredTime,
    urgency,
    specialty
  } = req.body

  try {
    const requests = getDoctorRequests()
    const id = getNextId(requests)
    const request = {
      id,
      user_id: req.user?.id || null,
      full_name: fullName,
      email,
      phone,
      symptoms,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      urgency,
      specialty,
      created_at: new Date().toISOString()
    }

    requests.unshift(request)
    saveDoctorRequests(requests)

    const requestId = `REQ-${id}`

    return res.status(201).json({
      success: true,
      message: 'Your consultation request has been submitted successfully.',
      requestId: requestId,
      estimatedResponseTime: urgency === 'High' ? '2-4 hours' : urgency === 'Medium' ? '24 hours' : '48 hours',
      nextSteps: [
        'Our team will review your request',
        'You will receive a confirmation email shortly',
        'A healthcare provider will contact you to confirm the appointment'
      ]
    })
  } catch (err) {
    console.error('Doctor request error:', err)
    res.status(500).json({ error: 'Failed to submit request' })
  }
})

module.exports = router
