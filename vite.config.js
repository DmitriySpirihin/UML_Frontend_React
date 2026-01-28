import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: 'https://dmitriyspirihin.github.io/UML_Frontend_React/',
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets')
    }
  },
  build: {
    outDir: 'build',
    // Increase limit to 1.5MB to silence warnings if chunks are still slightly large
    chunkSizeWarningLimit: 1600, 
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. Recharts (Visualization)
          if (id.includes('recharts')) {
            return 'recharts';
          }
          
          // 2. TON SDK & Buffer (Heavy logic)
          if (id.includes('@tonconnect') || id.includes('ton-core') || id.includes('ton-crypto') || id.includes('buffer')) {
            return 'ton-sdk';
          }

          // 3. Framer Motion (Animation library is very heavy)
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }

          // 4. React Core (React, ReactDOM, Router)
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-core';
          }

          // 5. Everything else remains in 'vendor'
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
});