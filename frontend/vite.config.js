import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // use relative paths for built assets so the app works when
  // served from any route (e.g. /home, /profile) with rewrites
  base: './',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // backend dev server now listens on port 10000 by default (configured
        // in backend/.env).  You can override with VITE_API_URL if needed.
        target: process.env.VITE_API_URL || 'http://localhost:10000',
        changeOrigin: true
      },
      '/ml': {
        target: process.env.VITE_ML_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
