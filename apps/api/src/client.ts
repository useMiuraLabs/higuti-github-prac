import { hc } from "hono/client";
import type { AppType } from "./index";

// 型をビルド時に計算させ、FE の tsserver が毎回 AppType を展開しなくて済むようにする
// https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended
const client = hc<AppType>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);
