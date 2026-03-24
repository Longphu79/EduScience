import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: true, 
    port: 5173,
    allowedHosts: [
      'csbooking.io.vn',
      'www.csbooking.io.vn',
      '54.151.183.124'
    ]
  }
})