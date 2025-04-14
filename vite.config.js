// vite.config.js
import { defineConfig } from 'vite';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  define: {
    global: 'window',
    'process.env': {}, // mock env to avoid crash
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
