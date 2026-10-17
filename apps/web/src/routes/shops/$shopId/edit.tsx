import { createFileRoute, notFound } from "@tanstack/react-router";
import * as v from "valibot";
import { fetchShop } from "../../../features/shop-crud/api/shops";
import { ShopForm } from "../../../features/shop-crud/components/ShopForm";
import { ShopNotFound } from "../../../features/shop-crud/components/ShopNotFound";

// ?status=visited: 詳細の「行った！に変更してレビューを書く」から来た。それ以外の値は無視する
const searchSchema = v.object({
  status: v.fallback(v.optional(v.literal("visited")), undefined),
});

// 店舗編集画面 (#21)
export const Route = createFileRoute("/shops/$shopId/edit")({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const shop = await fetchShop(params.shopId);
    if (!shop) throw notFound();
    return shop;
  },
  component: ShopEditPage,
  notFoundComponent: ShopNotFound,
});

function ShopEditPage() {
  const shop = Route.useLoaderData();
  const { status } = Route.useSearch();
  // 同じ画面のまま別の店に移ったとき、フォームの初期値を作り直す
  return <ShopForm key={shop.id} shop={shop} startAsVisited={status === "visited"} />;
}
