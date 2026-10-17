import * as v from "valibot";

// 店舗まわりで FE・BE・DB が共有する定義。選択肢や上限を変えるときはここだけを直す

export const SHOP_STATUSES = ["want_to_go", "visited"] as const;
export type ShopStatus = (typeof SHOP_STATUSES)[number];
export const SHOP_STATUS_LABELS: Record<ShopStatus, string> = {
  want_to_go: "行きたい",
  visited: "行った",
};

export const SHOP_MEMBERS = ["miura", "yuma"] as const;
export type ShopMember = (typeof SHOP_MEMBERS)[number];

export const SHOP_NAME_MAX_LENGTH = 100;
export const SHOP_AREA_MAX_LENGTH = 50;
export const SHOP_GENRE_MAX_LENGTH = 50;
export const SHOP_RATING_MIN = 1;
export const SHOP_RATING_MAX = 5;

// 一覧と詳細の両方が返す形
export const shopSchema = v.object({
  id: v.number(),
  name: v.string(),
  area: v.string(),
  genre: v.string(),
  status: v.picklist(SHOP_STATUSES),
  mapUrl: v.nullable(v.string()),
  rating: v.nullable(v.number()),
  memo: v.nullable(v.string()),
  imageUrl: v.nullable(v.string()),
  visitedAt: v.nullable(v.string()),
  createdBy: v.picklist(SHOP_MEMBERS),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export type Shop = v.InferOutput<typeof shopSchema>;
