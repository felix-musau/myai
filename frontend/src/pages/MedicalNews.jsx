import React, { useState, useEffect } from 'react'
import { useAuth } from '../App'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'

export default function MedicalNews() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/medical-news')
        const data = res.data
        setArticles(data.articles || [])
      } catch (err) {
        console.error('Failed fetching news:', err)
        setError(err.message || 'Failed to load news')
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <h1 className="text-xl font-bold text-gray-800">Medical News</h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {loading && <p>Loading articles...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, idx) => (
              <Card key={idx} className="flex flex-col">
                {a.urlToImage && (
                  <img
                    src={a.urlToImage}
                    alt={a.title}
                    className="h-40 w-full object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-700 flex-1">{a.description}</p>
                  <div className="mt-4 text-xs text-gray-500">Source: {a.source}</div>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    Read More →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
