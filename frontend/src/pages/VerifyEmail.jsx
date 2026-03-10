import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// This page used to handle email verification, but the app no longer
// requires email confirmation. The route exists only in case someone
// manually visits it, and will quickly redirect them back to login.

export default function VerifyEmail() {
  const navigate = useNavigate()

  useEffect(() => {
    // Immediately redirect as there's nothing to verify anymore.
    const timer = setTimeout(() => navigate('/login', { replace: true }), 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-white/70 pointer-events-none"></div>
      <div className="relative z-10">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-gray-700 font-medical">Email verification is no longer required. Redirecting to login...</p>
        </div>
      </div>
    </div>
  )
}
