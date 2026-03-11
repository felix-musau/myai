require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const authRoutes = require('./routes/auth')
const chatbotRoutes = require('./routes/chatbot')
// predictRoutes removed – now using Groq API for chatbot
const consultationRoutes = require('./routes/consultations')
const doctorRequestsRoutes = require('./routes/doctorRequests')
const testimonialsRoutes = require('./routes/testimonials')
const labResultsRoutes = require('./routes/labResults')
const medicalNewsRoutes = require('./routes/medicalNews')

// Ensure db directory and files exist on startup (for Render ephemeral filesystem)
const dbDir = path.join(__dirname, 'db')
const usersFile = path.join(dbDir, 'users.json')
const consultationsFile = path.join(dbDir, 'consultations.json')

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  console.log('✅ Created db directory')
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify({ users: [] }, null, 2))
  console.log('✅ Created users.json')
}

if (!fs.existsSync(consultationsFile)) {
  fs.writeFileSync(consultationsFile, JSON.stringify({ consultations: [] }, null, 2))
  console.log('✅ Created consultations.json')
}

const app = express()
app.use(express.json())
app.use(cookieParser())

// Security headers to prevent caching of protected content - prevents back button access after logout
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  
  // Add Vary header for cookie-based caching
  if (req.path.startsWith('/api/')) {
    res.setHeader('Vary', 'Cookie')
    // Clear auth token when explicitly requested (logout)
    if (req.headers['x-clear-auth'] === 'true') {
      res.clearCookie('token')
    }
  }
  
  next()
})

// Token blacklist for invalidated tokens (logged out users)
const tokenBlacklist = new Set()

// Export for use in auth routes
module.exports.tokenBlacklist = tokenBlacklist

// allow requests from the configured frontend URL plus localhost during development
// undefined origin is permitted for tools like curl/Postman
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean)
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  allowedHeaders: ['Content-Type']
}))

app.use('/api/auth', authRoutes)
app.use('/api', chatbotRoutes)
// predict endpoint no longer needed
app.use('/api', consultationRoutes)
app.use('/api', doctorRequestsRoutes)
app.use('/api', testimonialsRoutes)
app.use('/api', labResultsRoutes)
app.use('/api', medicalNewsRoutes)


app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});
const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`)
});
