import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: 'https://dmitriyspirihin.github.io/UML_Frontend_React/', // ✅ trailing space already fixed
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://ultymylife.ru',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 2000,
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
