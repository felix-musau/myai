const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

// Mock testimonials data - can be moved to database later
const testimonials = [
  { id: 1, name: "Lamek Onyango", rating: 5, text: "The AI consultation helped me understand my symptoms better. The follow-up with a real doctor was seamless!", date: "2026-02-25" },
  { id: 2, name: "Nikki Mackenzie", rating: 5, text: "Amazing experience! The symptom checker is accurate and the recommendations were very helpful.", date: "2026-02-26" },
  { id: 3, name: "David Simiyu", rating: 4, text: "Great platform for quick health assessments. The interface is user-friendly and professional.", date: "2026-02-27" },
  { id: 4, name: "Felix Musau", rating: 5, text: "I was skeptical at first, but the AI provided insights that my doctor later confirmed. Highly recommend!", date: "2026-02-28" },
  { id: 5, name: "Elias Keya", rating: 4, text: "Very convenient for getting quick medical advice without leaving home. The responses are thorough.", date: "2026-03-01" },
  { id: 6, name: "Victor Ngige", rating: 5, text: "The emergency feature gave me peace of mind when I wasn't sure if my symptoms were serious.", date: "2026-03-02" },
  { id: 7, name: "Martin Njau", rating: 4, text: "Helpful for tracking my health over time. The history feature is very useful.", date: "2026-03-02" }
]

// helper to append to the same file that frontend reads
function appendReviewToFile(review) {
  const filePath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'testimonials.json')
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    const arr = JSON.parse(data)
    arr.push(review)
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to append review file:', e)
  }
}

// GET /api/testimonials
// Returns all testimonials with average rating
router.get('/testimonials', (req, res) => {
  // Calculate average rating
  const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0)
  const averageRating = (totalRating / testimonials.length).toFixed(1)
  
  res.json({
    success: true,
    testimonials: testimonials,
    summary: {
      averageRating: parseFloat(averageRating),
      totalReviews: testimonials.length,
      ratingDistribution: {
        5: testimonials.filter(t => t.rating === 5).length,
        4: testimonials.filter(t => t.rating === 4).length,
        3: testimonials.filter(t => t.rating === 3).length,
        2: testimonials.filter(t => t.rating === 2).length,
        1: testimonials.filter(t => t.rating === 1).length
      }
    }
  })
})

// POST /api/testimonials - add a new review (not shown immediately)
router.post('/testimonials', (req, res) => {
  const { name, rating, text } = req.body
  if (!name || !rating || !text) {
    return res.status(400).json({ success: false, error: 'name, rating and text required' })
  }
  const newId = testimonials.length ? Math.max(...testimonials.map(t => t.id)) + 1 : 1
  const newReview = {
    id: newId,
    name,
    rating: parseInt(rating),
    text,
    date: new Date().toISOString().split('T')[0]
  }
  testimonials.push(newReview)
  appendReviewToFile(newReview)
  // do not return the new review in response to keep it hidden if frontend ignores it
  res.json({ success: true })
})

module.exports = router
