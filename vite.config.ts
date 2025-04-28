import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifestJson from "./public/manifest.json";
import tailwindcss from "@tailwindcss/vite";

// 使用类型断言确保background.type为"module"类型
const manifest = {
  ...manifestJson,
  background: {
    ...manifestJson.background,
    type: "module", // 明确指定为字面量"module"
  },
} as const;

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup/popup.html",
        playSound: "src/content/playSound.ts",
      },
    },
  },
});
