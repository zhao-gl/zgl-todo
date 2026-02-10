import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: false,
  },
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       math: 'always',
  //       javascriptEnabled: true,
  //       additionalData: `@import "@/styles/variables.less";` // 全局变量
  //     },
  //   },
  // }
})
