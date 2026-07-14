import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/itunes-proxy': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (requestPath) => {
          const url = new URL(requestPath, 'http://localhost')
          const endpoint = url.searchParams.get('endpoint') || 'search'
          url.searchParams.delete('endpoint')
          if (endpoint.includes('/')) {
            return `/${endpoint}`
          }
          const qs = url.searchParams.toString()
          return `/${endpoint}${qs ? `?${qs}` : ''}`
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['content-disposition']
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8'
          })
        },
      },
    },
  },
})
