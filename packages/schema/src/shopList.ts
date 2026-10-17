import * as v from "valibot";
import { SHOP_STATUSES } from "./shop";

export const SHOP_SORT_ORDERS = ["created_desc", "rating_desc", "visited_desc"] as const;
export type ShopSortOrder = (typeof SHOP_SORT_ORDERS)[number];
export const SHOP_SORT_LABELS: Record<ShopSortOrder, string> = {
  created_desc: "登録が新しい順",
  rating_desc: "評価が高い順",
  visited_desc: "訪問日が新しい順",
};

export const shopListQuerySchema = v.object({
  status: v.optional(v.picklist(SHOP_STATUSES)),
  area: v.optional(v.string()),
  genre: v.optional(v.string()),
  keyword: v.optional(v.string()),
  sort: v.optional(v.picklist(SHOP_SORT_ORDERS)),
});

export type ShopListQuery = v.InferOutput<typeof shopListQuerySchema>;
