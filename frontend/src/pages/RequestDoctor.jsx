import React, { useState } from 'react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import specialtiesData from '../data/specialties.json'

const urgencyLevels = [
  { value: 'Low', label: 'Low', description: 'Non-urgent, general consultation', color: 'text-green-600' },
  { value: 'Medium', label: 'Medium', description: 'Needs attention within 24-48 hours', color: 'text-yellow-600' },
  { value: 'High', label: 'High', description: 'Urgent, requires soon as possible', color: 'text-red-600' }
]

export default function RequestDoctor() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    symptoms: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'Medium',
    specialty: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Please describe your symptoms'
    if (!formData.preferredDate) newErrors.preferredDate = 'Please select a preferred date'
    if (!formData.preferredTime) newErrors.preferredTime = 'Please select a preferred time'
    if (!formData.specialty) newErrors.specialty = 'Please select a specialty'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await axios.post('/api/request-doctor', formData, { withCredentials: true })
      setSuccessData(response.data)
      setShowSuccessModal(true)
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        symptoms: '',
        preferredDate: '',
        preferredTime: '',
        urgency: 'Medium',
        specialty: ''
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      setErrors({ submit: 'Failed to submit request. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-medical">🏥 Request a Doctor</h1>
          <p className="text-gray-600 font-medical">Schedule a consultation with our healthcare professionals</p>
        </div>

        <Card padding="lg" shadow="lg" className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b font-medical">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.fullName ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.email ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.phone ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Symptoms Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b font-medical">Medical Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Describe Your Symptoms *</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.symptoms ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                  placeholder="Please describe your symptoms in detail, including when they started and any relevant factors..."
                />
                {errors.symptoms && <p className="text-red-500 text-sm mt-1">{errors.symptoms}</p>}
              </div>
            </div>

            {/* Appointment Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b font-medical">Appointment Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Preferred Date *</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.preferredDate ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                  />
                  {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">Preferred Time *</label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${errors.preferredTime ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'}`}
                  >
                    <option value="">Select a time</option>
                    <option value="morning">Morning (9AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 4PM)</option>
                    <option value="evening">Evening (4PM - 7PM)</option>
                  </select>
                  {errors.preferredTime && <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>}
                </div>
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b font-medical">Urgency Level</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {urgencyLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all font-medical ${
                      formData.urgency === level.value
                        ? 'border-blue-500 bg-blue-50/80 backdrop-blur'
                        : 'border-gray-200/50 bg-white/40 backdrop-blur hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className={`block font-semibold text-lg ${level.color}`}>{level.label}</span>
                      <span className="block text-sm text-gray-600 mt-1">{level.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Specialty Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b font-medical">Select Specialty</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {specialtiesData.map((specialty) => (
                  <label
                    key={specialty.id}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all font-medical ${
                      formData.specialty === specialty.name
                        ? 'border-blue-500 bg-blue-50/80 backdrop-blur'
                        : 'border-gray-200/50 bg-white/40 backdrop-blur hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="specialty"
                      value={specialty.name}
                      checked={formData.specialty === specialty.name}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="block text-2xl mb-1">{specialty.icon}</span>
                      <span className="block font-semibold text-gray-800">{specialty.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.specialty && <p className="text-red-500 text-sm mt-2">{errors.specialty}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
                icon="📅"
              >
                Request Consultation
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="✅ Request Submitted Successfully!"
        size="md"
      >
        {successData && (
          <div className="space-y-4">
            <div className="bg-blue-50/80 backdrop-blur p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medical">
                <strong>Request ID:</strong> {successData.requestId}
              </p>
              <p className="text-sm text-blue-800 mt-1 font-medical">
                <strong>Estimated Response:</strong> {successData.estimatedResponseTime}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 font-medical">Next Steps:</h4>
              <ul className="space-y-2">
                {successData.nextSteps?.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600 font-medical">
                    <span className="text-blue-500 mt-1">✓</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-gray-500 italic font-medical">
              A confirmation email has been sent to your email address.
            </p>

            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
