import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ✅ NOT -swc
import path from 'path';

export default defineConfig({
  base: 'https://dmitriyspirihin.github.io/UML_Frontend_React/', // ✅ removed trailing spaces
  plugins: [react()], // ✅ now supports ?react on SVGs
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets')
    }
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
  },
});