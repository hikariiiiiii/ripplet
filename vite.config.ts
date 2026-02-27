import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'http', 'https', 'os', 'url', 'assert', 'events', 'zlib'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ws: 'xrpl/dist/npm/client/WSWrapper',
    },
  },
  define: {
    'process.env': {},
    'globalThis.MockedWebSocket': 'undefined',
  },
  optimizeDeps: {
    include: ['xrpl'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    proxy: {
      '/xumm-api': {
        target: 'https://xumm.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xumm-api/, '/api/v1/platform'),
        secure: true,
      },
      // WebSocket proxy for Xumm status updates
      '/xumm-ws': {
        target: 'wss://xumm.app',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xumm-ws/, ''),
      },
    },
  },
})
