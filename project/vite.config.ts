import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  // Strip dev-only noise from production bundles. `console.*`/`debugger`
  // calls add bytes and force string serialization at runtime; removing them
  // shrinks the bundle and avoids needless main-thread work in production.
  esbuild:
    mode === 'production'
      ? { drop: ['console', 'debugger'], legalComments: 'none' }
      : undefined,
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Target modern evergreen browsers so esbuild emits leaner output with no
    // legacy down-leveling (smaller JS, faster parse/eval on device).
    target: 'es2020',
    cssTarget: 'chrome87',
    // Skip gzip-size reporting during build (pure CPU cost, no artifact change).
    reportCompressedSize: false,
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
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/@sentry/')) {
            return 'vendor-sentry';
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
}));
