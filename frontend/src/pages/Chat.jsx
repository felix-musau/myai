import React, { useState } from 'react'
import api from '../services/api'

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am MyAI Healthcare assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/message', { message: userText })
      const reply = res.data.reply || 'No reply'
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }])
    } catch (err) {
      console.error('Chat API error:', err)
      setError(err.response?.data?.error || 'Chat request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/ai.jpg')] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Health Chat</h1>
        <p className="mb-4 text-gray-600">Chat is protected and available after login. Ask medical questions safely.</p>

        <div className="h-80 overflow-auto border border-gray-200 rounded p-3 bg-gray-50 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {error && <div className="mb-3 text-red-600">{error}</div>}

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            disabled={loading}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
