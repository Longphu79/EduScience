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

    allowedHosts: [
      'eduscience.id.vn'
    ],

    cors: {
      origin: [
        'https://eduscience.id.vn',
        'http://localhost:5173'
      ]
    }
  }
})