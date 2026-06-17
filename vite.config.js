import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'VolunTrack — Volunteer Hour Tracker',
        short_name: 'VolunTrack',
        description: 'Track volunteer hours, set goals, earn badges, and export reports.',
        theme_color: '#3f8344',
        background_color: '#f1f8f1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/favicon.svg',  sizes: 'any',     type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icons/icon-192.png',  sizes: '192x192',  type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png',  sizes: '512x512',  type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Google Fonts — cache-first so offline still has them
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173 },
})
