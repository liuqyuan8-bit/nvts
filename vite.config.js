import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 环境变量前缀（默认就是 VITE_）
  envPrefix: 'VITE_', 
});