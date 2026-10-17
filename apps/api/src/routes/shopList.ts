import { Hono } from "hono";

// 店舗一覧・検索 (#20) の担当が書く: GET /api/shops
export const shopListRoute = new Hono<{ Bindings: Env }>();
