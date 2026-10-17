import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // tanstackRouter は react より前に置く必要がある
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    // apps/api の Worker を同じ dev サーバーで動かし、本番と同じルーティング (assets / run_worker_first) を再現する
    cloudflare({
      configPath: "../api/wrangler.jsonc",
      // `wrangler d1 migrations apply --local` (apps/api で実行) と同じローカル D1 を使う
      persistState: { path: "../api/.wrangler/state" },
    }),
  ],
});
