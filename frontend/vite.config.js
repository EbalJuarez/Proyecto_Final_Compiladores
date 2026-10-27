import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 4000 }, // Monaco empaquetado localmente pesa ~3.5 MB
  server: {
    port: 5173,
    // En desarrollo, /api se reenvía al servidor Express (sin necesidad de CORS).
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 3001}`,
    },
  },
});
