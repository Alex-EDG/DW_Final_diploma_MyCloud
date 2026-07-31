import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react() ],
  // Настройки сборки
  build: {
    outDir: 'dist',                  // Директория вывода
    assetsDir: 'assets',             // Поддиректория для ресурсов
    sourcemap: false,                // Отключить source maps в prod
    minify: 'esbuild',               // Минификатор (быстрее terser)
    target: 'es2015',                // Поддержка браузеров
    cssCodeSplit: true,              // Разделять CSS по чанкам
    chunkSizeWarningLimit: 1000,     // Предупреждение (КБ)
    emptyOutDir: true,               // Очищать dist перед сборкой
    reportCompressedSize: false,     // Не считать размер сжатых файлов (ускоряет сборку)
    rollupOptions: {
      input: ['src/main.jsx', 'src/index.css', './index.html'],
    },
  },
  // Настройки dev-сервера
  server: {
    port: 8080,           // Порт (по умолчанию 5173)
    host: '0.0.0.0',      // Слушать на 0.0.0.0 (доступно в сети)
    open: true,           // Открыть браузер при запуске
    https: false,         // HTTPS для dev-сервера
  },
  resolve: {
    alias: {
      '@': '/src' // Alias для src
    }
  }
});
