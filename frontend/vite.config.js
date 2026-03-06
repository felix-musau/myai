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
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true
      },
      '/ml': {
        target: process.env.VITE_ML_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
