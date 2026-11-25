import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/api/screener': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/screener/, '/api')
      },
      '/api/intern-logs': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/intern-logs/, '')
      },
      '/api/work-descriptions': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/logs': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/review': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/job-portal': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true
      },
      '/preview': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true
      },
      '/review': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://127.0.0.1:5000',
        ws: true
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss('./tailwind.config.js'),
        autoprefixer(),
      ]
    }
  }
})

