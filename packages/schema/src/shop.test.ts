import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { shopSchema } from "./shop";

const shop = {
  id: 1,
  name: "珈琲店",
  area: "清澄白河",
  genre: "カフェ",
  status: "visited",
  mapUrl: null,
  rating: 5,
  memo: null,
  imageUrl: null,
  visitedAt: "2026-10-17",
  createdBy: "miura",
  createdAt: "2026-10-17 12:00:00",
  updatedAt: "2026-10-17 12:00:00",
};

describe("shopSchema", () => {
  it("決めた選択肢以外のステータスと登録者を拒否する", () => {
    expect(v.safeParse(shopSchema, shop).success).toBe(true);
    expect(v.safeParse(shopSchema, { ...shop, status: "closed" }).success).toBe(false);
    expect(v.safeParse(shopSchema, { ...shop, createdBy: "UserA" }).success).toBe(false);
  });
});
