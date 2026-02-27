import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

// Import new pages
import RequestDoctor from './pages/RequestDoctor'
import Emergency from './pages/Emergency'
import SuccessStories from './pages/SuccessStories'
import FAQ from './pages/FAQ'
import LabResults from './pages/LabResults'
import Home from './pages/Home'
import Profile from './pages/Profile'

// Auth Context
export const AuthContext = createContext(null)

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Navbar Component
function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true })
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      logout()
      navigate('/login', { replace: true })
    }
  }

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/hospitals', label: 'Hospitals' },
    { href: '/history', label: 'History' },
    { href: '/request-doctor', label: 'Request Doctor' },
    { href: '/emergency', label: 'Emergency', emergency: true },
    { href: '/success-stories', label: 'Success Stories' },
    { href: '/faq', label: 'FAQ' },
    { href: '/lab-results', label: 'Lab Results' },
    { href: '/contact', label: 'Contact' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-blue-600 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <a href="/home" className="text-white text-xl font-bold">MyAI Healthcare</a>
        </div>
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md transition ${
                link.emergency
                  ? 'bg-red-500 hover:bg-red-600 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              {link.label}
            </a>
          ))}
          {user && (
            <span className="text-white px-3 py-2 hidden sm:inline-block">
              Hi, {user.username}
            </span>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition ml-2"
            >
              Logout
            </button>
          )}
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-blue-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md transition ${
                  link.emergency
                    ? 'bg-red-500 hover:bg-red-600 font-semibold text-center'
                    : 'hover:bg-blue-700'
                }`}
              >
                {link.label}
              </a>
            ))}
            {user && (
              <div className="px-3 py-2 text-white">
                Hi, {user.username}
              </div>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition mt-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// Login Page
function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await axios.post('/api/auth/login', form, { withCredentials: true })
      // store user info object
      login({ username: res.data.username, email: res.data.email })
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🏥</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to MyAI Healthcare</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline font-semibold">Register</a>
          </p>
          <p className="text-gray-600 mt-2">
            <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Register Page
function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const res = await axios.post('/api/auth/register', form)
      if(res.data.username){
        login({ username: res.data.username, email: res.data.email })
        navigate('/home')
      } else {
        setSuccess(res.data.message)
        setTimeout(() => navigate('/login'), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🏥</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Create Account</h1>
          <p className="text-gray-600 mt-2">Join MyAI Healthcare today</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Choose username"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Create password (min 8 chars)"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, number & special char</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-semibold">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  )
}



// Forgot password page
function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email })
      setSuccess(res.data.message)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Forgot Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive reset link</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  )
}

// Reset password page
function ResetPasswordPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/reset-password', { token, password })
      setSuccess(res.data.message)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Reset Password</h1>
          <p className="text-gray-600 mt-2">Choose a new password</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  )
}

// Home Page with Facts (major part) and Chatbot (sidebar)
function HomePage() {
  const [fact, setFact] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadFact()
    const interval = setInterval(loadFact, 8000)
    return () => clearInterval(interval)
  }, [])
  
  async function loadFact() {
    try {
      const res = await axios.get('/fact')
      setFact(res.data.fact)
    } catch (err) {
      console.error('Error loading fact:', err)
    }
  }
  
  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    
    try {
      const res = await axios.post('/chat', { message: userMsg })
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }
  
  async function resetChat() {
    try {
      await axios.get('/reset')
      setMessages([])
    } catch (err) {
      console.error('Reset error:', err)
    }
  }
  
  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Facts Panel - Major Part */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Health Facts</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{fact}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏥 About MyAI Healthcare</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to MyAI Healthcare, your intelligent healthcare assistant powered by advanced machine learning. 
              Our system can help identify potential health conditions based on your symptoms.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-sm text-blue-800">
                <strong>⚠️ Medical Disclaimer:</strong> This is not a medical diagnosis. 
                Always consult with a healthcare professional for accurate medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot Sidebar */}
      <div className="w-96 bg-white border-l shadow-xl flex flex-col">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="font-bold text-lg">🤖 MyAI Assistant</h3>
          <button onClick={resetChat} className="text-xs text-blue-200 hover:text-white mt-1">
            Reset Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-4xl mb-4">👋</p>
              <p>Say "hello" to start your consultation</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Hospitals Page with Map
function HospitalsPage() {
  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="h-full w-full relative">
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">🏥 Find Hospitals</h2>
          <p className="text-gray-600 text-sm">View nearby hospitals and healthcare facilities on the map.</p>
        </div>
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl">🗺️</span>
            <p className="text-gray-600 mt-4">Map View</p>
            <p className="text-sm text-gray-500">Full-screen map integration</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// History Page
function HistoryPage() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadHistory()
  }, [])
  
  async function loadHistory() {
    try {
      const res = await axios.get('/api/consultations')
      setConsultations(res.data.consultations || [])
    } catch (err) {
      console.error('Error loading history:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Consultation History</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <span className="textxl">📝-5</span>
            <p className="text-gray-600 mt-4">No consultations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((c, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{c.predicted_disease}</h3>
                    <p className="text-sm text-gray-600">Symptoms: {c.symptoms}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Contact Page
function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState(false)
  
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await axios.post('/send-message', form)
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error('Contact error:', err)
    }
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📞 Contact Us</h1>
        
        <div className="bg-white rounded-xl shadow p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Thank you! We'll get back to you soon.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Export useAuth hook for use in pages
export function useAuth() {
  return useContext(AuthContext)
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    checkAuth()
    // re-check auth on page show (back/forward navigation)
    const handlePageShow = (e) => {
      if (e.persisted) {
        checkAuth()
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])
  
  async function checkAuth() {
    try {
      const res = await axios.get('/api/auth/check')
      if (res.data.authenticated) {
        setUser(res.data.username)
      }
    } catch (err) {
      console.error('Auth check error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  function login(userObj) {
    setUser(userObj)
  }
  
  function logout() {
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')]">
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute><HospitalsPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
<Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="/request-doctor" element={<ProtectedRoute><RequestDoctor /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/success-stories" element={<ProtectedRoute><SuccessStories /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
          <Route path="/lab-results" element={<ProtectedRoute><LabResults /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}
