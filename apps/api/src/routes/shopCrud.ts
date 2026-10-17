import { Hono } from "hono";

// 店舗の登録・詳細・レビュー (#21) の担当が書く: GET /api/shops/:id, POST /api/shops, PATCH /api/shops/:id, DELETE /api/shops/:id
export const shopCrudRoute = new Hono<{ Bindings: Env }>();
