import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import Card from '../components/ui/Card'
import StarRating from '../components/ui/StarRating'
import Button from '../components/ui/Button'
import testimonialsData from '../data/testimonials.json'

export default function SuccessStories() {
  const { user } = useContext(AuthContext)
  const [testimonials, setTestimonials] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newReview, setNewReview] = useState({ name: user?.username || '', rating: 5, text: '' })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  useEffect(() => {
    if(showForm && user) {
      setNewReview(r => ({ ...r, name: user.username }))
    }
  }, [showForm, user])

  const fetchTestimonials = async () => {
    try {
      // Try to fetch from API
      const response = await axios.get('/api/testimonials', { withCredentials: true })
      if (response.data.success) {
        setTestimonials(response.data.testimonials)
        setSummary(response.data.summary)
        return
      }
    } catch (error) {
      console.log('Using mock data fallback')
    }
    
    // Fallback to local mock data
    setTestimonials(testimonialsData)
    const totalRating = testimonialsData.reduce((sum, t) => sum + t.rating, 0)
    setSummary({
      averageRating: (totalRating / testimonialsData.length).toFixed(1),
      totalReviews: testimonialsData.length
    })
  }

  // handler to submit a new review from form
  const submitReview = async (review) => {
    try {
      await axios.post('/api/testimonials', review, { withCredentials: true })
      alert('Thank you for your review. It has been recorded.')
      setShowForm(false)
      setNewReview({ name: '', rating: 5, text: '' })
      // optionally refresh testimonials
      fetchTestimonials()
    } catch (err) {
      console.error('Review submission error', err)
      alert('Failed to submit review. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-medical">⭐ Success Stories</h1>
          <p className="text-gray-600 font-medical">Hear what our patients have to say about their experience</p>
        </div>

        {/* Rating Summary */}
        {summary && (
          <Card padding="lg" shadow="lg" className="glass-card mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2 font-medical">
                  {summary.averageRating}
                </div>
                <StarRating rating={Math.round(summary.averageRating)} size="lg" />
                <p className="text-gray-600 mt-2 font-medical">Average Rating</p>
              </div>
              
              <div className="h-20 w-px bg-gray-200 hidden md:block"></div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2 font-medical">
                  {summary.totalReviews}
                </div>
                <p className="text-gray-600 mt-2 font-medical">Total Reviews</p>
              </div>
              
              {summary.ratingDistribution && (
                <>
                  <div className="h-20 w-px bg-gray-200 hidden md:block"></div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-4 font-medical">{star}</span>
                        <StarRating rating={star} size="sm" />
                        <div className="w-24 h-2 bg-gray-200/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ 
                              width: `${(summary.ratingDistribution[star] / summary.totalReviews) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8 font-medical">
                          {summary.ratingDistribution[star]}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              padding="md" 
              shadow="md" 
              hover={true}
              className="glass-card flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 font-medical">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500 font-medical">
                      {new Date(testimonial.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <StarRating rating={testimonial.rating} size="sm" />
              </div>
              
              <p className="text-gray-700 flex-1 leading-relaxed font-medical">
                "{testimonial.text}"
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                <span className="text-sm text-blue-600 font-medium font-medical">
                  Verified Patient ✓
                </span>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action or Review Form */}
        <Card padding="lg" shadow="lg" className="mt-8 text-center bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur text-white">
          {!showForm ? (
            <>
              <h2 className="text-2xl font-bold mb-2 font-medical">Share Your Experience</h2>
              <p className="text-blue-100 mb-4 font-medical">
                Help others by sharing your journey with MyAI Healthcare
              </p>
              <Button variant="glass" onClick={() => setShowForm(true)}>
                Write a Review
              </Button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitReview(newReview)
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Your name or nickname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  {[5,4,3,2,1].map((n) => (
                    <option key={n} value={n}>{n} star{n>1?'s':''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Review</label>
                <textarea
                  value={newReview.text}
                  onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Write about your experience..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
