import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Doctor Request API
export const requestDoctor = async (data) => {
  try {
    const response = await api.post('/request-doctor', data)
    return response.data
  } catch (error) {
    console.error('Error requesting doctor:', error)
    throw error
  }
}

// Testimonials API
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials')
    return response.data
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    throw error
  }
}

// Lab Results API
export const analyzeLab = async (data) => {
  try {
    const response = await api.post('/analyze-lab', data)
    return response.data
  } catch (error) {
    console.error('Error analyzing lab results:', error)
    throw error
  }
}

export default api
