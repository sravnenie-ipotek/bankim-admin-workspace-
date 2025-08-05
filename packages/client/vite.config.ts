import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const port = parseInt(env.PORT || '4002')
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000'
  
  return {
    plugins: [react()],
    server: {
      port: port,
      host: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: port,
      host: true
    }
  }
}) 