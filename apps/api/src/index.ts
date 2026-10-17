import { Hono } from "hono";
import { shopCrudRoute } from "./routes/shopCrud";
import { shopListRoute } from "./routes/shopList";

// 機能ごとのルートはここで登録済み。並行開発中は各担当が routes/ の自分のファイルだけを書く
const app = new Hono<{ Bindings: Env }>()
  .basePath("/api")
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/shops", shopListRoute)
  .route("/shops", shopCrudRoute);

export type AppType = typeof app;

export default app;
