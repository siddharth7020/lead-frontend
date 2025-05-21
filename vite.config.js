import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'lead-frontend.onrender.com'
    ],
    proxy: {
      '/api': {
        target: 'https://lead-backend-o70f.onrender.com/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? +process.env.PORT : 4173,
    allowedHosts: [
      'lead-frontend.onrender.com'
    ]
  }
});