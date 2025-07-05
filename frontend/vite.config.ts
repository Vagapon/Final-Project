import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), glsl()],
  publicDir: 'public', // Đảm bảo tài sản tĩnh trong public
  server: {
    host: true,
    open: true, // Mở trình duyệt tự động
  },
  build: {
    outDir: 'dist', // Thư mục output khi build, không cần '../dist'
    emptyOutDir: true,
    sourcemap: true,
  },
});