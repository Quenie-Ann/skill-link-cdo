import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // If on Vercel, use '/', otherwise use the local folder as the base path
  base: process.env.VERCEL ? '/' : '/skill-link-cdo/',
}))