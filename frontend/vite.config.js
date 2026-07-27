import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react() ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.jsx'),
      name: 'src/index.css',
    },
    sourcemap: true // или 'hidden' если не требуется
  },
  server: {
    port: 8080,
    open: true // Автоматически открывать браузер
  },
  resolve: {
    alias: {
      '@': '/src' // Alias для src
    }
  }
});
