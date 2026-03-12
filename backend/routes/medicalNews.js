const express = require('express')
const router = express.Router()
const axios = require('axios')

// Fallback articles in case API fails
const fallbackArticles = [
  {
    title: "New Study: Exercise Reduces Risk of Heart Disease",
    description: "Recent research shows that regular physical activity can significantly reduce cardiovascular health risks.",
    url: "#",
    source: "Health Daily",
    urlToImage: null
  },
  {
    title: "Mental Health Awareness Month Highlights Importance of Self-Care",
    description: "Experts emphasize the importance of mental health and strategies for maintaining emotional well-being.",
    url: "#",
    source: "Wellness Today",
    urlToImage: null
  },
  {
    title: "New Treatment Options Available for Chronic Pain",
    description: "Medical professionals announce breakthrough treatments for chronic pain management.",
    url: "#",
    source: "Medical News",
    urlToImage: null
  }
];

// GET /api/medical-news
// returns an array of articles from external news API
let newsCache = {
  timestamp: 0,
  articles: []
};

router.get('/medical-news', async (req, res) => {
  console.log('Received /medical-news request from', req.ip || req.headers['x-forwarded-for'] || 'unknown')
  // if we fetched recently (10 mins), return cached
  const now = Date.now();
  if (now - newsCache.timestamp < 10 * 60 * 1000 && newsCache.articles.length) {
    return res.json({ articles: newsCache.articles });
  }

  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      console.warn('NEWS_API_KEY not configured, using fallback articles')
      return res.json({ articles: fallbackArticles })
    }

    // fetch health-related headlines with timeout
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'health',
        language: 'en',
        pageSize: 20,
        apiKey
      },
      timeout: 7000
    })

    const articles = (response.data.articles || []).map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name,
      urlToImage: a.urlToImage
    }))

    if (!articles || articles.length === 0) {
      console.warn('No articles received from API, using fallback')
      res.json({ articles: fallbackArticles })
    } else {
      newsCache = { timestamp: now, articles };
      res.json({ articles })
    }
  } catch (err) {
    console.error('News fetch error:', err.response?.status, err.response?.data?.message || err.message)
    // serve cached if available
    if (newsCache.articles.length) {
      return res.json({ articles: newsCache.articles })
    }
    // else fallback
    res.json({ articles: fallbackArticles })
  }
})

module.exports = router
