import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { shopListQuerySchema } from "./shopList";

describe("shopListQuerySchema", () => {
  it("空のクエリや有効な検索・ソート条件を受け付ける", () => {
    expect(v.safeParse(shopListQuerySchema, {}).success).toBe(true);
    expect(
      v.safeParse(shopListQuerySchema, {
        status: "want_to_go",
        area: "清澄白河",
        genre: "カフェ",
        keyword: "ラテ",
        sort: "rating_desc",
      }).success,
    ).toBe(true);
  });

  it("不正なステータスやソート順を拒否する", () => {
    expect(v.safeParse(shopListQuerySchema, { status: "invalid" }).success).toBe(false);
    expect(v.safeParse(shopListQuerySchema, { sort: "invalid" }).success).toBe(false);
  });
});
