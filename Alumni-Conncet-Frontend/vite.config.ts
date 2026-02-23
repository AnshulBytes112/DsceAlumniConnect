import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from "path"

// https://vite.dev/config/
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
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
