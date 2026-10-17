import { hcWithType } from "@higuti/api/client";

// FE と API は同一オリジンで配信する (dev は @cloudflare/vite-plugin が同じ dev サーバーで Worker を動かす)
export const api = hcWithType("/").api;
