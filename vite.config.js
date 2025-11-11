import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {

  return {
    base: 'https://dmitriyspirihin.github.io/UltyMyLife_Bot/',
    plugins: [react()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        assets: path.resolve(__dirname, './src/assets')
      }
    },
    build: {
      outDir: 'build',
    },
  }
})
