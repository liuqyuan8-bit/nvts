// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",   // ← 这行最关键！扫描所有 src 里的文件
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'), // 如果使用了 daisyui 依赖则需要添加
  ],
  daisyui: {
    themes: ["light"],
  },
}