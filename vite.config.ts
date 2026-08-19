import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev: /api/rss  →  https://chinanewscloud.com/api/v1/rss-news
      '/api/rss': {
        target: 'https://chinanewscloud.com',
        changeOrigin: true,
        rewrite: () => '/api/v1/rss-news',
      },
    },
  },
})
