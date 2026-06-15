import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/events': 'http://localhost:5000',
      '/notify': 'http://localhost:5000',
      '/webhooks': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
    },
  },
});
