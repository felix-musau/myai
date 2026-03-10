import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function Contact() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // 'success' | 'error' | null
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80">
            <span className="text-2xl">🏥</span>
            <h1 className="text-xl font-bold text-gray-800">MyAI Healthcare</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:block">Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Contact & Support</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              📞 Contact & Support
            </h2>
            <p className="text-gray-600 mt-2">Get in touch with our team</p>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4">
              <h3 className="text-white font-bold text-lg">Send us a Message</h3>
            </div>

            <div className="p-6">
              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                  <p className="text-green-700">✅ Thank you! We'll get back to you soon.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700">❌ Something went wrong. Please try again.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="How can we help you?"
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">support@myai-healthcare.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <p className="text-gray-600">1-800-MYAI-HEALTH</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="font-medium text-gray-700">Hours</p>
                  <p className="text-gray-600">Mon-Fri: 9AM - 6PM EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
