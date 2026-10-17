import { shopListQuerySchema } from "@higuti/schema";
import { vValidator } from "@hono/valibot-validator";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import { shops } from "../db/schema";

// 店舗一覧・検索 (#20) の担当が書く: GET /api/shops
export const shopListRoute = new Hono<{ Bindings: Env }>().get(
  "/",
  vValidator("query", shopListQuerySchema),
  async (c) => {
    const { status, area, genre, keyword, sort = "created_desc" } = c.req.valid("query");
    const db = createDb(c.env.DB);

    const conditions: SQL[] = [];

    if (status) {
      conditions.push(eq(shops.status, status));
    }

    const trimmedArea = area?.trim();
    if (trimmedArea) {
      conditions.push(like(shops.area, `%${trimmedArea}%`));
    }

    const trimmedGenre = genre?.trim();
    if (trimmedGenre) {
      conditions.push(like(shops.genre, `%${trimmedGenre}%`));
    }

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
      const pattern = `%${trimmedKeyword}%`;
      const keywordCondition = or(like(shops.name, pattern), like(shops.memo, pattern));
      if (keywordCondition) {
        conditions.push(keywordCondition);
      }
    }

    const orderBy =
      sort === "rating_desc"
        ? [sql`${shops.rating} IS NULL ASC`, desc(shops.rating), desc(shops.id)]
        : sort === "visited_desc"
          ? [sql`${shops.visitedAt} IS NULL ASC`, desc(shops.visitedAt), desc(shops.id)]
          : [desc(shops.createdAt), desc(shops.id)];

    const result = await db
      .select()
      .from(shops)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(...orderBy);

    return c.json(result);
  },
);
