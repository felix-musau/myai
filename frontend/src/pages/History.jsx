import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function History() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/history')
      if (res.ok) {
        const text = await res.text()
        // Parse the HTML response to extract consultation data
        // For now, we'll show a message
        setConsultations([])
      }
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
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
          <span className="text-gray-600">Consultation History</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              📋 Consultation History
            </h2>
            <p className="text-gray-600 mt-2">View your past consultations and diagnoses</p>
          </div>

          {/* History List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
              <h3 className="text-white font-bold text-lg">Past Consultations</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading history...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">No consultations yet</p>
                <p className="text-gray-500 mt-2">Start a chat with MyAI to get your first consultation</p>
                <Link
                  to="/"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Consultation
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {consultations.map((consultation, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{consultation.predicted_disease}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Symptoms: {consultation.symptoms}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(consultation.created_at).toLocaleDateString()} at{' '}
                          {new Date(consultation.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          consultation.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                          consultation.confidence > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(consultation.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
