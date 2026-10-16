import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Clerk's Vercel Marketplace integration provisions its publishable key as
  // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY; widen Vite's client-exposed prefix so
  // it reaches the browser bundle without renaming it on every env pull.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
