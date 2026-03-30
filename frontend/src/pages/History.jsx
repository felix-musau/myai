import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { FiDownload, FiChevronLeft } from 'react-icons/fi'
import { FaHospital } from 'react-icons/fa'
import api from '../services/api'

export default function History() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await api.get('/consultations')
      setConsultations(res.data.consultations || [])
    } catch (err) {
      console.error('Failed to load history:', err)
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const downloadHistory = async (format) => {
    try {
      setDownloading(true)
      const response = await api.get(`/consultations/download/${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `consultation-history-${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download history')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80">
            <FaHospital className="text-2xl text-blue-600" />
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  📋 Consultation History
                </h2>
                <p className="text-gray-600 mt-2">View your past consultations and chat messages</p>
              </div>
              {consultations.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadHistory('csv')}
                    disabled={downloading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <FiDownload /> CSV
                  </button>
                  <button
                    onClick={() => downloadHistory('json')}
                    disabled={downloading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <FiDownload /> JSON
                  </button>
                </div>
              )}
            </div>
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
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r mb-3">
                          <p className="text-sm font-medium text-gray-700">You asked:</p>
                          <p className="text-sm text-gray-800 mt-1">{consultation.message}</p>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded-r">
                          <p className="text-sm font-medium text-gray-700">MyAI replied:</p>
                          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{consultation.reply}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          {new Date(consultation.created_at).toLocaleDateString()} at{' '}
                          {new Date(consultation.created_at).toLocaleTimeString()}
                        </p>
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
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              <FiChevronLeft /> Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
