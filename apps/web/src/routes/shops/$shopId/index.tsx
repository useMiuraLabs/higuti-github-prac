import { createFileRoute, notFound } from "@tanstack/react-router";
import { fetchShop } from "../../../features/shop-crud/api/shops";
import { ShopDetail } from "../../../features/shop-crud/components/ShopDetail";
import { ShopNotFound } from "../../../features/shop-crud/components/ShopNotFound";

// 店舗詳細・レビュー画面 (#21)
export const Route = createFileRoute("/shops/$shopId/")({
  loader: async ({ params }) => {
    const shop = await fetchShop(params.shopId);
    if (!shop) throw notFound();
    return shop;
  },
  component: ShopDetailPage,
  notFoundComponent: ShopNotFound,
});

function ShopDetailPage() {
  return <ShopDetail shop={Route.useLoaderData()} />;
}
