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
    // Increase limit to 2000kB (2MB) so you don't see the yellow warning.
    // A 1.5MB vendor file is perfectly fine for modern 4G/WiFi.
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. Keep Recharts separate (fixes your specific circular dependency issue)
          if (id.includes('recharts')) {
            return 'recharts';
          }
          
          // 2. Keep TON SDK separate (Optimizes initial load)
          if (id.includes('@tonconnect') || id.includes('ton-core') || id.includes('ton-crypto') || id.includes('buffer')) {
            return 'ton-sdk';
          }

          // 3. DO NOT split React or Framer Motion anymore. 
          // Putting them back into 'vendor' fixes the initialization error.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
});