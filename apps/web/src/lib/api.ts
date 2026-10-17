import { hcWithType } from "@higuti/api/client";

// FE と API は同一オリジンで配信する (dev は Vite の proxy 経由)
export const api = hcWithType("/").api;
