import { defineConfig } from 'vite'

export default defineConfig({
  base: '/3D-Solar-System/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
}) 