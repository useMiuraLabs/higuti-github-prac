import type { Shop } from "@higuti/schema";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KEYWORD_DEBOUNCE_MS } from "../hooks/useShopList";
import { ShopListPage } from "./ShopListPage";

const MOCK_SHOPS: Shop[] = [
  {
    id: 1,
    name: "架空珈琲 清澄店",
    area: "清澄白河",
    genre: "カフェ",
    status: "visited",
    mapUrl: null,
    rating: 5,
    memo: "ラテが最高だった",
    imageUrl: null,
    visitedAt: "2026-09-20",
    createdBy: "miura",
    createdAt: "2026-10-01 10:00:00",
    updatedAt: "2026-10-01 10:00:00",
  },
  {
    id: 2,
    name: "テスト麺房",
    area: "新宿",
    genre: "ラーメン",
    status: "want_to_go",
    mapUrl: null,
    rating: null,
    memo: "味噌が気になる",
    imageUrl: null,
    visitedAt: null,
    createdBy: "yuma",
    createdAt: "2026-10-02 10:00:00",
    updatedAt: "2026-10-02 10:00:00",
  },
  {
    id: 3,
    name: "サンプル食堂",
    area: "西荻窪",
    genre: "定食",
    status: "visited",
    mapUrl: null,
    rating: 3,
    memo: "日替わりの唐揚げがおすすめ",
    imageUrl: null,
    visitedAt: "2026-10-12",
    createdBy: "yuma",
    createdAt: "2026-10-03 10:00:00",
    updatedAt: "2026-10-03 10:00:00",
  },
];

function renderShopList(shops: readonly Shop[] = MOCK_SHOPS) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <ShopListPage initialShops={shops} />,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/shops/$shopId",
    component: () => <h1>お店の詳細</h1>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, detailRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(<RouterProvider router={router} />);
}

describe("ShopListPage", () => {
  it("店舗カードを一覧表示し、ステータス・エリア・ジャンル・検索ボタンで絞り込める", async () => {
    renderShopList();

    expect(await screen.findByText("架空珈琲 清澄店")).toBeTruthy();
    expect(screen.getByText("テスト麺房")).toBeTruthy();
    expect(screen.getByText("サンプル食堂")).toBeTruthy();
    expect(screen.getByText("全 3 件")).toBeTruthy();

    // ステータス「行きたい」で絞り込み
    fireEvent.click(screen.getByRole("button", { name: "行きたい" }));
    expect(screen.queryByText("架空珈琲 清澄店")).toBeNull();
    expect(screen.getByText("テスト麺房")).toBeTruthy();
    expect(screen.getByText("全 1 件")).toBeTruthy();

    // 条件クリアで全件に戻る
    fireEvent.click(screen.getByRole("button", { name: "条件をクリア" }));
    expect(screen.getByText("全 3 件")).toBeTruthy();

    // フリーワード入力直後はまだ絞り込まれず、検索ボタン押下で即座に絞り込まれる
    fireEvent.change(screen.getByLabelText("フリーワード"), { target: { value: "ラテ" } });
    expect(screen.getByText("全 3 件")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    expect(screen.getByText("架空珈琲 清澄店")).toBeTruthy();
    expect(screen.queryByText("サンプル食堂")).toBeNull();
    expect(screen.getByText("全 1 件")).toBeTruthy();
  });

  it("フリーワード入力が止まってから 3 秒後に自動で API を叩いて絞り込む（入力中は叩かない）", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json([MOCK_SHOPS[0]]));
    vi.stubGlobal("fetch", fetchMock);

    renderShopList();
    await screen.findByText("架空珈琲 清澄店");

    vi.useFakeTimers();
    try {
      fireEvent.change(screen.getByLabelText("フリーワード"), { target: { value: "ラ" } });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.change(screen.getByLabelText("フリーワード"), { target: { value: "ラテ" } });

      // 入力から 2.9 秒時点ではまだ API を叩かない
      await act(async () => {
        vi.advanceTimersByTime(KEYWORD_DEBOUNCE_MS - 100);
      });
      expect(fetchMock).not.toHaveBeenCalled();

      // 最後の入力から 3 秒経過した時点で 1 回だけ API を叩く
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText("全 1 件")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("評価が高い順・訪問日が新しい順で並び替えられる", async () => {
    renderShopList();
    await screen.findByText("架空珈琲 清澄店");

    // 評価が高い順: 架空珈琲 (5) -> サンプル食堂 (3) -> テスト麺房 (null)
    fireEvent.change(screen.getByLabelText("並び替え"), { target: { value: "rating_desc" } });
    const linksByRating = screen.getAllByRole("link");
    expect(linksByRating[0]?.textContent).toContain("架空珈琲 清澄店");
    expect(linksByRating[1]?.textContent).toContain("サンプル食堂");
    expect(linksByRating[2]?.textContent).toContain("テスト麺房");

    // 訪問日が新しい順: サンプル食堂 (2026-10-12) -> 架空珈琲 (2026-09-20) -> テスト麺房 (null)
    fireEvent.change(screen.getByLabelText("並び替え"), { target: { value: "visited_desc" } });
    const linksByVisited = screen.getAllByRole("link");
    expect(linksByVisited[0]?.textContent).toContain("サンプル食堂");
    expect(linksByVisited[1]?.textContent).toContain("架空珈琲 清澄店");
    expect(linksByVisited[2]?.textContent).toContain("テスト麺房");
  });

  it("店舗カードをクリックすると詳細画面へ遷移する", async () => {
    renderShopList();
    const cardText = await screen.findByText("架空珈琲 清澄店");
    fireEvent.click(cardText);
    expect(await screen.findByRole("heading", { name: "お店の詳細" })).toBeTruthy();
  });
});
