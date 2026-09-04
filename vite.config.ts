import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// VITE_BASE se nastavuje při buildu na GitHub Pages (např. "/andyho-narozky-app/").
// Lokálně a na Vercelu zůstává "/".
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
})
