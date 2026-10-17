import type { Shop } from "@higuti/schema";
import { vi } from "vitest";

export const visitedShop: Shop = {
  id: 1,
  name: "架空珈琲 清澄店",
  area: "清澄白河",
  genre: "カフェ",
  status: "visited",
  mapUrl: "https://maps.google.com/?q=a",
  rating: 5,
  memo: "ラテが最高だった",
  imageUrl: "https://example.com/a.jpg",
  visitedAt: "2026-09-20",
  createdBy: "miura",
  createdAt: "2026-09-20 12:00:00",
  updatedAt: "2026-09-20 12:00:00",
};

export type Request = { method: string; path: string; body: unknown };

// fetch を差し替え、/api/shops/1 だけが存在する API として振る舞う。送られたリクエストを記録する
export const stubApi = (shop: Shop = visitedShop) => {
  const requests: Request[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), "http://localhost");
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      requests.push({ method, path: url.pathname, body });
      if (url.pathname === `/api/shops/${shop.id}`) {
        if (method === "PATCH") return Response.json({ ...shop, ...body });
        return Response.json(shop);
      }
      if (/^\/api\/shops\/\d+$/.test(url.pathname))
        return Response.json({ message: "お店が見つかりません" }, { status: 404 });
      return Response.json({ message: "入力に誤りがあります" }, { status: 400 });
    }),
  );
  return requests;
};
