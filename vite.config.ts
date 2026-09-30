import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // Auto-generate and inject the service worker registration script
      registerType: 'prompt',

      // Include additional static assets beyond the default build output
      includeAssets: ['favicon.svg', 'icons/*.png'],

      // Web App Manifest — controls installability and standalone mode
      manifest: {
        name: 'POS Cashier',
        short_name: 'POS',
        description: 'Offline-first Point of Sale cashier terminal',
        theme_color: '#1e293b',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'landscape',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Workbox configuration — caching strategies per resource type
      workbox: {
        // App shell files: serve from cache first, update in background
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],

        runtimeCaching: [
          {
            // Local Edge API: network-first, fall back to cache (offline resilience)
            urlPattern: /^https?:\/\/localhost:5009\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pos-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Product images: serve stale immediately, refresh in background
            urlPattern: /\.(?:png|jpg|jpeg|webp|gif|svg)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pos-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },

      // Dev mode: enable SW in development for easier testing
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
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
