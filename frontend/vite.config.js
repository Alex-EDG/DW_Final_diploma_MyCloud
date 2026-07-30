import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react() ],
  // Настройки сборки
  build: {
    outDir: 'build',           // Директория вывода (по умолчанию 'dist')
    sourcemap: true,          // Генерировать source maps
    lib: {
      entry: path.resolve(__dirname, 'src/main.jsx'),
      name: 'src/index.css',
    },
    sourcemap: true // или 'hidden' если не требуется
  },
  // Настройки dev-сервера
  server: {
    port: 3000,           // Порт (по умолчанию 5173)
    host: true,           // Слушать на 0.0.0.0 (доступно в сети)
    open: true,           // Открыть браузер при запуске
    https: false,         // HTTPS для dev-сервера
  },
  resolve: {
    alias: {
      '@': '/src' // Alias для src
    }
  }
});
