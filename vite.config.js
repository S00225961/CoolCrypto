import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    global: 'globalThis' 
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util']
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util'
    }
  }
});