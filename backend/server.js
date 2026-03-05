require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const chatbotRoutes = require('./routes/chatbot')
const predictRoutes = require('./routes/predict')
const consultationRoutes = require('./routes/consultations')
const doctorRequestsRoutes = require('./routes/doctorRequests')
const testimonialsRoutes = require('./routes/testimonials')
const labResultsRoutes = require('./routes/labResults')
const medicalNewsRoutes = require('./routes/medicalNews')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true,
  allowedHeaders: ['Content-Type']
}))

app.use('/api/auth', authRoutes)
app.use('/api', chatbotRoutes)
app.use('/api', predictRoutes)
app.use('/api', consultationRoutes)
app.use('/api', doctorRequestsRoutes)
app.use('/api', testimonialsRoutes)
app.use('/api', labResultsRoutes)
app.use('/api', medicalNewsRoutes)

// if running in production we may want to serve the frontend build from the backend
if (process.env.NODE_ENV === 'production') {
  const _path = require('path')
  app.use(express.static(_path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(_path.join(__dirname, '../frontend/dist/index.html'))
  })
}

app.get('/api/health', (req, res) => res.json({ok:true}))

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log(`Backend listening on port ${port}`))
