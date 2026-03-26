import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [expiresAt, setExpiresAt] = useState(searchParams.get('expires') || '')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!expiresAt) return
    const checkTime = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemainingSeconds(diff)
      if (diff <= 0) {
        setStatus('expired')
      }
    }

    checkTime()
    const timer = setInterval(checkTime, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (!token) {
      setError('Verification code is required.')
      return
    }

    if (remainingSeconds <= 0) {
      setError('Code has expired. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/verify-email', { token })
      setStatus('success')
      setVerified(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setStatus('failed')
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setStatus('')
    const email = window.prompt('Enter your email to resend verification token:')
    if (!email) return

    try {
      const res = await api.post('/auth/resend-verification', { email })
      const { emailVerificationToken, emailVerificationExpires } = res.data
      setToken(emailVerificationToken)
      setExpiresAt(emailVerificationExpires)
      setStatus('resent')
      setError('')
      setVerified(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Resend failed')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
      <div className="relative z-10 max-w-lg w-full p-6 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>

        {verified ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded mb-4">
            Email verified! Redirecting to login...
          </div>
        ) : (
          <>
            <p className="mb-2 text-gray-700">Enter your verification code below.</p>
            {expiresAt && (
              <p className="mb-2 text-sm text-gray-600">
                Token expires in: <strong>{remainingSeconds}s</strong>
              </p>
            )}
            {status === 'expired' && (
              <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
                Verification expired. Click Resend to get a new code.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                placeholder="Enter code"
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={loading || status === 'expired'}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || !token || status === 'expired'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <button
              onClick={handleResend}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded"
            >
              Resend Code
            </button>
          </>
        )}

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-3 text-center text-sm text-blue-600 hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}

