import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {

    },
  },
  define: {
    global: 'window', // You can still keep global as window if needed
  },
});

