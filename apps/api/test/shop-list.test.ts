import type { Shop } from "@higuti/schema";
import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../src";

describe("GET /api/shops", () => {
  beforeAll(async () => {
    await env.DB.prepare(
      `INSERT INTO shops (name, area, genre, status, rating, memo, visited_at, created_by)
       VALUES
         ('一覧テスト珈琲', '清澄白河', 'カフェ', 'visited', 5, 'エチオピアの浅煎りが絶品', '2026-10-10', 'miura'),
         ('一覧テスト麺処', '新宿', 'ラーメン', 'want_to_go', NULL, '濃厚鶏白湯が気になる', NULL, 'yuma'),
         ('一覧テスト食堂', '清澄白河', '定食', 'visited', 3, '生姜焼き定食', '2026-10-15', 'yuma')`,
    ).run();
  });

  it("条件なしで店舗一覧を取得できる", async () => {
    const res = await app.request("/api/shops", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Shop[];
    expect(body.some((shop) => shop.name === "一覧テスト珈琲")).toBe(true);
    expect(body.some((shop) => shop.name === "一覧テスト麺処")).toBe(true);
  });

  it("status・area・genre・keyword を組み合わせて絞り込める", async () => {
    const params = new URLSearchParams({
      status: "visited",
      area: "清澄白河",
      genre: "カフェ",
      keyword: "エチオピア",
    });
    const res = await app.request(`/api/shops?${params.toString()}`, {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Shop[];
    expect(body.map((shop) => shop.name)).toContain("一覧テスト珈琲");
    expect(body.map((shop) => shop.name)).not.toContain("一覧テスト麺処");
    expect(body.map((shop) => shop.name)).not.toContain("一覧テスト食堂");
  });

  it("sort=rating_desc と sort=visited_desc で並び替えられる", async () => {
    const ratingRes = await app.request("/api/shops?area=清澄白河&sort=rating_desc", {}, env);
    expect(ratingRes.status).toBe(200);
    const byRating = (await ratingRes.json()) as Shop[];
    const coffeeIdx = byRating.findIndex((shop) => shop.name === "一覧テスト珈琲");
    const dinerIdx = byRating.findIndex((shop) => shop.name === "一覧テスト食堂");
    expect(coffeeIdx).toBeGreaterThanOrEqual(0);
    expect(dinerIdx).toBeGreaterThan(coffeeIdx);

    const visitedRes = await app.request("/api/shops?area=清澄白河&sort=visited_desc", {}, env);
    expect(visitedRes.status).toBe(200);
    const byVisited = (await visitedRes.json()) as Shop[];
    const visitedDinerIdx = byVisited.findIndex((shop) => shop.name === "一覧テスト食堂");
    const visitedCoffeeIdx = byVisited.findIndex((shop) => shop.name === "一覧テスト珈琲");
    expect(visitedDinerIdx).toBeGreaterThanOrEqual(0);
    expect(visitedCoffeeIdx).toBeGreaterThan(visitedDinerIdx);
  });

  it("不正なクエリパラメータは 400 を返す", async () => {
    const res = await app.request("/api/shops?status=invalid_status", {}, env);
    expect(res.status).toBe(400);
  });
});
