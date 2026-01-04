import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: 'https://dmitriyspirihin.github.io/UML_Frontend_React/', // ✅ trailing space already fixed
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets')
    }
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Bundle all Recharts modules into a single chunk to avoid circular dependency warnings
          recharts: ['recharts']
        }
      }
    }
  },
});