const express = require('express')
const router = express.Router()

// POST /api/request-doctor
// Mock endpoint - logs request and returns success
// Ready for database integration later
router.post('/request-doctor', (req, res) => {
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

  // Log the request (in production, save to database)
  console.log('=== Doctor Consultation Request ===')
  console.log('Full Name:', fullName)
  console.log('Email:', email)
  console.log('Phone:', phone)
  console.log('Symptoms:', symptoms)
  console.log('Preferred Date:', preferredDate)
  console.log('Preferred Time:', preferredTime)
  console.log('Urgency:', urgency)
  console.log('Specialty:', specialty)
  console.log('================================')

  // Generate a mock request ID
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Return success response
  res.status(201).json({
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
})

module.exports = router
