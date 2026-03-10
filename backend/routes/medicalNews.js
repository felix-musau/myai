const express = require('express')
const router = express.Router()
const axios = require('axios')

// GET /api/medical-news
// returns an array of articles from external news API
router.get('/medical-news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'NEWS_API_KEY not configured' })
    }

    // fetch health-related headlines
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'health',
        language: 'en',
        pageSize: 20,
        apiKey
      }
    })

    const articles = (response.data.articles || []).map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name,
      urlToImage: a.urlToImage
    }))

    res.json({ articles })
  } catch (err) {
    console.error('News fetch error:', err.response?.status, err.response?.data || err.message)
    res.status(502).json({ error: 'Failed to fetch news' })
  }
})

module.exports = router
