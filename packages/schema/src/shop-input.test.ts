import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  createShopSchema,
  findReviewFieldErrors,
  shopIdParamSchema,
  todayInJst,
  updateShopSchema,
} from "./shop";

const base = {
  name: "テスト麺房",
  area: "新宿",
  genre: "ラーメン",
  status: "want_to_go",
  createdBy: "miura",
};
const errorOf = (schema: v.GenericSchema, input: unknown, key: string) => {
  const result = v.safeParse(schema, input);
  return result.success ? undefined : v.flatten(result.issues).nested?.[key]?.[0];
};

describe("createShopSchema", () => {
  it("前後の空白を除き、空欄の任意項目は null にする", () => {
    const output = v.parse(createShopSchema, {
      ...base,
      name: "  テスト麺房  ",
      mapUrl: "",
      memo: "  ",
    });
    expect(output).toMatchObject({ name: "テスト麺房", mapUrl: null, memo: null });
  });

  it("空白だけの店名を拒否する", () => {
    expect(errorOf(createShopSchema, { ...base, name: "   " }, "name")).toBe(
      "店名を入力してください",
    );
  });

  it("http(s) 以外の URL を拒否する", () => {
    expect(
      errorOf(createShopSchema, { ...base, mapUrl: "javascript:alert(1)" }, "mapUrl"),
    ).toBeDefined();
    expect(
      errorOf(createShopSchema, { ...base, imageUrl: "data:image/png;base64,AAAA" }, "imageUrl"),
    ).toBeDefined();
    expect(
      v.safeParse(createShopSchema, { ...base, mapUrl: "https://maps.google.com/?q=a" }).success,
    ).toBe(true);
  });

  it("存在しない日付と、今日より後の訪問日を拒否する", () => {
    const visited = { ...base, status: "visited" };
    expect(errorOf(createShopSchema, { ...visited, visitedAt: "2026-02-30" }, "visitedAt")).toBe(
      "存在する日付を入力してください",
    );
    expect(errorOf(createShopSchema, { ...visited, visitedAt: "2999-01-01" }, "visitedAt")).toBe(
      "今日より後の日付は入力できません",
    );
    expect(v.safeParse(createShopSchema, { ...visited, visitedAt: todayInJst() }).success).toBe(
      true,
    );
  });

  it("評価は 1〜5 の整数だけ", () => {
    expect(errorOf(createShopSchema, { ...base, rating: 6 }, "rating")).toBeDefined();
    expect(errorOf(createShopSchema, { ...base, rating: 4.5 }, "rating")).toBeDefined();
  });
});

describe("updateShopSchema", () => {
  it("登録者を送ったら拒否する", () => {
    expect(v.safeParse(updateShopSchema, { createdBy: "yuma" }).success).toBe(false);
  });

  it("送らなかった項目は出力に含めない", () => {
    expect(v.parse(updateShopSchema, { rating: 5 })).toEqual({ rating: 5 });
  });
});

describe("findReviewFieldErrors", () => {
  it("「行きたい」のときだけ、値の入ったレビュー項目をエラーにする", () => {
    expect(findReviewFieldErrors("want_to_go", { rating: 5, visitedAt: null })).toEqual({
      rating: "「行きたい」のお店には入力できません",
    });
    expect(findReviewFieldErrors("visited", { rating: 5 })).toEqual({});
  });
});

describe("todayInJst", () => {
  it("UTC で前日でも、日本時間の日付を返す", () => {
    expect(todayInJst(new Date("2026-10-17T16:00:00Z"))).toBe("2026-10-18");
  });
});

describe("shopIdParamSchema", () => {
  it("正の整数だけを数値にする", () => {
    expect(v.parse(shopIdParamSchema, { id: "3" })).toEqual({ id: 3 });
    for (const id of ["0", "abc", "1.5", "-1"])
      expect(v.safeParse(shopIdParamSchema, { id }).success).toBe(false);
  });
});
