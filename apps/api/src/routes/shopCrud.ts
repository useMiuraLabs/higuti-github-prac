import {
  type ApiError,
  createShopSchema,
  findReviewFieldErrors,
  SHOP_REVIEW_FIELDS,
  shopIdParamSchema,
  updateShopSchema,
} from "@higuti/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import { shops } from "../db/schema";
import { validate } from "../lib/validate";

const NOT_FOUND: ApiError = { message: "お店が見つかりません" };
const reviewError = (fieldErrors: Record<string, string>): ApiError => ({
  message: "入力に誤りがあります",
  fieldErrors,
});

// 店舗の登録・詳細・レビュー (#21): GET /api/shops/:id, POST /api/shops, PATCH /api/shops/:id, DELETE /api/shops/:id
export const shopCrudRoute = new Hono<{ Bindings: Env }>()
  .get("/:id", validate("param", shopIdParamSchema), async (c) => {
    const [shop] = await createDb(c.env.DB)
      .select()
      .from(shops)
      .where(eq(shops.id, c.req.valid("param").id));
    if (!shop) return c.json(NOT_FOUND, 404);
    return c.json(shop, 200);
  })
  .post("/", validate("json", createShopSchema), async (c) => {
    const input = c.req.valid("json");
    const fieldErrors = findReviewFieldErrors(input.status, input);
    if (Object.keys(fieldErrors).length > 0) return c.json(reviewError(fieldErrors), 400);
    const [shop] = await createDb(c.env.DB).insert(shops).values(input).returning();
    return c.json(shop!, 201);
  })
  .patch(
    "/:id",
    validate("param", shopIdParamSchema),
    validate("json", updateShopSchema),
    async (c) => {
      const db = createDb(c.env.DB);
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const [current] = await db.select().from(shops).where(eq(shops.id, id));
      if (!current) return c.json(NOT_FOUND, 404);

      // 今の値に送られた項目を重ねた「保存後の状態」で、ステータスとレビュー項目の組み合わせを検証する
      const status = input.status ?? current.status;
      const fieldErrors = findReviewFieldErrors(status, input);
      if (Object.keys(fieldErrors).length > 0) return c.json(reviewError(fieldErrors), 400);

      // 「行きたい」で保存するときは、評価・訪問日・写真を消す
      const clearReview =
        status === "want_to_go"
          ? Object.fromEntries(SHOP_REVIEW_FIELDS.map((key) => [key, null]))
          : {};
      const [shop] = await db
        .update(shops)
        .set({ ...input, ...clearReview })
        .where(eq(shops.id, id))
        .returning();
      return c.json(shop!, 200);
    },
  )
  .delete("/:id", validate("param", shopIdParamSchema), async (c) => {
    const [shop] = await createDb(c.env.DB)
      .delete(shops)
      .where(eq(shops.id, c.req.valid("param").id))
      .returning({ id: shops.id });
    if (!shop) return c.json(NOT_FOUND, 404);
    return c.body(null, 204);
  });
