import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Coach - Entrenador Integral',
        short_name: 'Coach',
        description: 'Tu entrenador de fitness personalizado',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@coach/types': path.resolve(__dirname, '../src/types'),
      '@coach/running': path.resolve(__dirname, '../src/running'),
      '@coach/strength': path.resolve(__dirname, '../src/strength'),
      '@coach/nutrition': path.resolve(__dirname, '../src/nutrition'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
})
