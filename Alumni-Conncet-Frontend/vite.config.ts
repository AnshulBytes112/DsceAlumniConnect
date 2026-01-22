import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: env.VITE_API_PROXY_URL ? {
        '/api': {
          target: env.VITE_API_PROXY_URL,
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
  };
})
