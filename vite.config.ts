import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Изменяем настройки сервера для обеспечения корректной работы с Supabase
    host: true, 
    port: 5173,
    strictPort: true,
    // Используем HTTP вместо HTTPS для локальной разработки
    https: false, 
    cors: {
      origin: '*',
    },
  }
});