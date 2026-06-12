import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/d3/') ||
            id.includes('node_modules/internmap/') ||
            id.includes('node_modules/robust-predicates/')
          ) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (
            id.includes('node_modules/@supabase/') ||
            id.includes('node_modules/isows/')
          ) {
            return 'vendor-supabase';
          }
          if (
            id.includes('node_modules/@zxing/') ||
            id.includes('node_modules/jsqr/')
          ) {
            return 'vendor-qr';
          }
        },
      },
    },
  },
});
