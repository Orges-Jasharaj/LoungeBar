import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5067',
        changeOrigin: true,
      }
    }
  },
  // Siguro që të gjitha routes të servojnë index.html për SPA routing
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

