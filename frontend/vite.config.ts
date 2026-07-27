import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from "path"

export default defineConfig({
  plugins: [react()],
  // Some browser-targeted dependencies (e.g. sockjs-client) still reference `global`.
  // In Vite, `global` is not defined by default, so map it to the standard `globalThis`.
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // ponytail: error loudly instead of silently drifting ports
    proxy: {
      // ponytail: one regex rule proxies ALL backend paths (/api/*, /auth/*, /events/*, etc.)
      '^/(api|auth|profile|alumni|events|dashboard|comments|posts|discussions|jobs|admin|uploads|profiles|resumes|ws-forum)': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
