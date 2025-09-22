import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy: UI dev server → local API at http://localhost:8787
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
