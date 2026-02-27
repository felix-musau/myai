import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

// Body facts for the facts panel
const bodyFacts = [
  "Your heart beats about 100,000 times per day",
  "You have about 37.2 trillion cells in your body",
  "Your bones are stronger than steel",
  "Your nose can remember 50,000 different scents",
  "Your brain uses 20% of your body's energy",
  "Your liver has over 500 functions",
  "Your lungs have a surface area of about 70 square meters",
  "Your skin is the largest organ",
  "Your stomach gets a new lining every 3-4 days",
  "You lose about 4kg of skin cells each year",
  "Your brain is 73% water",
  "Human DNA could stretch from Earth to the sun and back"
]

// Pro tips for health and first aid - alternating with body facts
const proTips = [
  "Drink at least 8 glasses of water daily to keep your body hydrated and functioning properly.",
  "Get 7-9 hours of sleep each night to allow your body to repair and recharge.",
  "Wash your hands frequently for at least 20 seconds to prevent the spread of germs.",
  "Apply ice to a sprain for 15-20 minutes every hour to reduce swelling.",
  "Take breaks every 30 minutes when working at a computer to prevent eye strain.",
  "Chew your food slowly to aid digestion and prevent overeating.",
  "Keep a first aid kit at home with bandages, antiseptic, and pain relievers.",
  "Check your posture while sitting - keep your back straight and shoulders relaxed.",
  "Replace your toothbrush every 3 months or after illness to maintain oral hygiene.",
  "Apply sunscreen with SPF 30+ daily to protect your skin from UV damage.",
  "Learn the Heimlich maneuver - it could save someone from choking.",
  "Keep emergency numbers saved in your phone for quick access.",
  "Elevate your legs for 15 minutes daily to improve circulation.",
  "Practice deep breathing exercises to reduce stress and anxiety.",
  "Keep medications in their original containers and check expiration dates regularly.",
  "Never ignore chest pain - seek medical attention immediately.",
  "Use the RICE method for injuries: Rest, Ice, Compression, Elevation.",
  "Stay up to date with vaccinations to protect yourself and others.",
  "Eat a balanced diet rich in fruits, vegetables, and lean proteins.",
  "Schedule regular health check-ups even when you feel healthy.",
  "Learn CPR - it can double or triple chances of survival during cardiac arrest."
]

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Chat state
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I\'m MyAI, your healthcare✨ Welcome to the assistant.\n\n HealthCare ChatBot!\n\n➡️ Say "hello" or "hi" to start your consultation.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Facts state
  const [currentFact, setCurrentFact] = useState('')
  const [factVisible, setFactVisible] = useState(true)
  const [isProTip, setIsProTip] = useState(false)
  const [factIndex, setFactIndex] = useState(0)
  
  // Mobile view state
  const [mobileView, setMobileView] = useState('facts') // 'facts' or 'chat'

  useEffect(() => {
    loadFact()
    const interval = setInterval(() => {
      setFactIndex(prev => {
        const nextIndex = prev + 1
        loadFactAtIndex(nextIndex)
        return nextIndex
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadFactAtIndex = (index) => {
    const allItems = [...bodyFacts, ...proTips]
    const isTip = index % 2 === 1
    setIsProTip(isTip)
    setFactVisible(false)
    setTimeout(() => {
      const selectedIndex = Math.floor(index / 2) % Math.max(bodyFacts.length, proTips.length)
      const fact = isTip ? proTips[selectedIndex % proTips.length] : bodyFacts[selectedIndex % bodyFacts.length]
      setCurrentFact(fact)
      setFactVisible(true)
    }, 300)
  }

  const loadFact = async () => {
    try {
      const res = await fetch('/api/fact')
      const data = await res.json()
      setIsProTip(false)
      setFactVisible(false)
      setTimeout(() => {
        setCurrentFact(data.fact)
        setFactVisible(true)
      }, 300)
    } catch (err) {
      const isTip = factIndex % 2 === 1
      setIsProTip(isTip)
      const selectedIndex = Math.floor(factIndex / 2) % Math.max(bodyFacts.length, proTips.length)
      const fact = isTip ? proTips[selectedIndex % proTips.length] : bodyFacts[selectedIndex % bodyFacts.length]
      setCurrentFact(fact)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const resetChat = async () => {
    if (confirm('Are you sure you want to reset?')) {
      try {
        await fetch('/api/reset', { method: 'POST' })
        setMessages([
          { sender: 'bot', text: '👋 Hello! I\'m MyAI, your healthcare assistant.\n\n✨ Welcome to the HealthCare ChatBot!\n\n➡️ Say "hello" or "hi" to start your consultation.' }
        ])
      } catch (err) {
        console.error('Reset error:', err)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold text-gray-800">MyAI Healthcare</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:block">Welcome, {user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="sm:hidden flex border-b bg-white">
        <button
          onClick={() => setMobileView('facts')}
          className={`flex-1 py-3 text-center font-medium ${mobileView === 'facts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          💡 Facts
        </button>
        <button
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-3 text-center font-medium ${mobileView === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          💬 Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        
        {/* Facts Panel - Major Part */}
        <div className={`flex-1 p-4 sm:p-6 overflow-y-auto ${mobileView === 'chat' ? 'hidden sm:block' : 'block'}`}>
          {/* Disclaimer */}
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>⚠️ MEDICAL DISCLAIMER:</strong> MyAI is an informational tool only. It is <strong>NOT</strong> a substitute for professional medical diagnosis or treatment. Always consult qualified healthcare professionals.
            </p>
          </div>

          {/* Facts Panel */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                💡 Did You Know?
              </h2>
            </div>
            <div className="p-6">
              <div className={`min-h-[120px] flex items-center justify-center rounded-xl p-6 border-l-4 transition-opacity duration-300 ${factVisible ? 'opacity-100' : 'opacity-0'} ${isProTip ? 'bg-gradient-to-br from-green-50 to-teal-50 border-green-500' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500'}`}>
                <p className="text-lg text-gray-800 text-center font-medium">
                  {currentFact || 'Loading fascinating facts...'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/history"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-center hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              📋 View History
            </Link>
            <Link
              to="/hospitals"
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-center hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              🏨 Find Hospitals
            </Link>
            <Link
              to="/contact"
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 px-6 rounded-xl font-semibold text-center hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              📞 Contact & Support
            </Link>
          </div>
        </div>

        {/* Chat Panel - Sidebar */}
        <div className={`w-full sm:w-96 bg-white shadow-xl flex flex-col ${mobileView === 'facts' ? 'hidden sm:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <h3 className="font-bold">💬 Healthcare ChatBot</h3>
            <p className="text-xs text-blue-100">Your AI Assistant</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-l-4 border-blue-600 text-gray-800 shadow'
                  }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-l-4 border-blue-600 p-3 rounded-xl shadow flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➤
              </button>
            </div>
            <button
              onClick={resetChat}
              className="w-full mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              🔄 Reset Chat
            </button>
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}
