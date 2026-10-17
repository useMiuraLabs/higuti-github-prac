import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import app from "../src";

const send = (method: string, path: string, body?: unknown) =>
  app.request(
    path,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env,
  );

const wantToGo = {
  name: "テスト麺房",
  area: "新宿",
  genre: "ラーメン",
  status: "want_to_go",
  createdBy: "miura",
};
const visited = {
  ...wantToGo,
  status: "visited",
  rating: 4,
  visitedAt: "2026-09-20",
  imageUrl: "https://example.com/a.jpg",
  memo: "美味しい",
};

const create = async (body: unknown) => {
  const res = await send("POST", "/api/shops", body);
  return (await res.json()) as { id: number } & Record<string, unknown>;
};

describe("POST /api/shops", () => {
  it("登録した店を 201 で返し、詳細でも同じ内容を取れる", async () => {
    const res = await send("POST", "/api/shops", visited);
    expect(res.status).toBe(201);
    const shop = (await res.json()) as { id: number };
    expect(shop).toMatchObject({ ...visited, mapUrl: null });

    const detail = await send("GET", `/api/shops/${shop.id}`);
    expect(await detail.json()).toEqual(shop);
  });

  it("入力エラーは項目ごとのエラー文で 400 を返す", async () => {
    const res = await send("POST", "/api/shops", {
      ...wantToGo,
      name: " ",
      mapUrl: "javascript:alert(1)",
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { fieldErrors: Record<string, string> };
    expect(Object.keys(body.fieldErrors).toSorted()).toEqual(["mapUrl", "name"]);
  });

  it("「行きたい」の店に評価を付けて登録しようとしたら 400", async () => {
    const res = await send("POST", "/api/shops", { ...wantToGo, rating: 5 });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      fieldErrors: { rating: "「行きたい」のお店には入力できません" },
    });
  });
});

describe("GET /api/shops/:id", () => {
  it("存在しない店は 404、ID が正の整数でなければ 400", async () => {
    const missing = await send("GET", "/api/shops/999999");
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ message: "お店が見つかりません" });
    expect((await send("GET", "/api/shops/abc")).status).toBe(400);
  });
});

describe("PATCH /api/shops/:id", () => {
  it("送った項目だけを変え、他の項目は変えない", async () => {
    const shop = await create(visited);
    const res = await send("PATCH", `/api/shops/${shop.id}`, { rating: 2 });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ...visited, rating: 2 });
  });

  it("「行きたい」に戻すと評価・訪問日・写真が消え、メモは残る", async () => {
    const shop = await create(visited);
    const res = await send("PATCH", `/api/shops/${shop.id}`, { status: "want_to_go" });
    expect(await res.json()).toMatchObject({
      status: "want_to_go",
      rating: null,
      visitedAt: null,
      imageUrl: null,
      memo: "美味しい",
    });
  });

  it("「行きたい」の店にステータスを変えずに評価だけ送ったら 400", async () => {
    const shop = await create(wantToGo);
    expect((await send("PATCH", `/api/shops/${shop.id}`, { rating: 5 })).status).toBe(400);
  });

  it("「行きたい」から「行った」に変えると同時にレビューを付けられる", async () => {
    const shop = await create(wantToGo);
    const res = await send("PATCH", `/api/shops/${shop.id}`, {
      status: "visited",
      rating: 5,
      visitedAt: "2026-10-01",
    });
    expect(await res.json()).toMatchObject({
      status: "visited",
      rating: 5,
      visitedAt: "2026-10-01",
    });
  });

  it("登録者は変えられない", async () => {
    const shop = await create(wantToGo);
    expect((await send("PATCH", `/api/shops/${shop.id}`, { createdBy: "yuma" })).status).toBe(400);
    const detail = await send("GET", `/api/shops/${shop.id}`);
    expect(await detail.json()).toMatchObject({ createdBy: "miura" });
  });

  it("存在しない店は 404", async () => {
    expect((await send("PATCH", "/api/shops/999999", { rating: 1 })).status).toBe(404);
  });
});

describe("DELETE /api/shops/:id", () => {
  it("削除すると 204 を返し、以後は 404 になる", async () => {
    const shop = await create(wantToGo);
    expect((await send("DELETE", `/api/shops/${shop.id}`)).status).toBe(204);
    expect((await send("GET", `/api/shops/${shop.id}`)).status).toBe(404);
    expect((await send("DELETE", `/api/shops/${shop.id}`)).status).toBe(404);
  });
});
