import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifestJson from "./public/manifest.json";
import tailwindcss from "@tailwindcss/vite";
import { Plugin } from "vite";

// 使用类型断言确保background.type为"module"类型
const manifest = {
  ...manifestJson,
  background: {
    ...manifestJson.background,
    type: "module", // 明确指定为字面量"module"
  },
} as const;

// 解决Vite 5+ manifest文件位置问题的hack
const viteManifestHack: Plugin & {
  renderCrxManifest?: (manifest: any, bundle: any) => void;
} = {
  name: "viteManifestHack",
  renderCrxManifest(_, bundle) {
    if (bundle[".vite/manifest.json"] && !bundle["manifest.json"]) {
      bundle["manifest.json"] = bundle[".vite/manifest.json"];
      bundle["manifest.json"].fileName = "manifest.json";
      delete bundle[".vite/manifest.json"];
    }
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), viteManifestHack, crx({ manifest })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup/popup.html",
        playSound: "src/content/playSound.ts",
        background: "src/background/service-worker.ts",
      },
    },
  },
});
