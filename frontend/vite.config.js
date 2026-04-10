import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const withDefault = (value, fallback) => (value && value.trim() ? value : fallback);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8081,
    proxy: {
      '/api/core': {
        target: withDefault(process.env.CORE_SERVICE_PROXY_URL, 'http://localhost:8001'),
        changeOrigin: true,
      },
      '/api/upload': {
        target: withDefault(process.env.UPLOAD_SERVICE_PROXY_URL, 'http://localhost:8002'),
        changeOrigin: true,
      },
      '/api/download': {
        target: withDefault(process.env.DOWNLOAD_SERVICE_PROXY_URL, 'http://localhost:8003'),
        changeOrigin: true,
      },
      '/api/admin': {
        target: withDefault(process.env.ADMIN_SERVICE_PROXY_URL, 'http://localhost:8004'),
        changeOrigin: true,
      },
      '/api/chat': {
        target: withDefault(process.env.CHAT_SERVICE_PROXY_URL, 'http://localhost:8005'),
        changeOrigin: true,
      },
    },
  },
});
