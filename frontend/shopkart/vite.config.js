import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/wishlist': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/cart': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/products': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        bypass: (req) => {
          // If browser is requesting an HTML page, serve the React app instead of proxying raw JSON
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    },
  },
})
