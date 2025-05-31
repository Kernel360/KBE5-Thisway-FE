import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // TODO: 이후 Spring CORS 설정 필요
      // 예: "/api"로 시작하는 요청은 모두 http://localhost:8080으로 프록시
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // 필요 시 pathRewrite도 설정 가능
        // rewrite: (path) => path.replace(/^\/api/, "")
      },
    },
    // open: true,
  },
});
