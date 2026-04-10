import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for VITAL dashboard.
// - Builds to ./dist (Vercel will pick this up as outputDirectory)
// - Dev server proxies /api/* to Vercel dev or your prod deploy if you want;
//   for now we leave the proxy off so api calls hit relative paths in production.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
