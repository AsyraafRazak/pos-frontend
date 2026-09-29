import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // Forward /api/... → http://localhost:5009/api/... during dev
      '/api': {
        target: 'http://localhost:5009',
        changeOrigin: true,
      },
    },
  },
})
