import { createFileRoute } from "@tanstack/react-router";
import { ShopListPage } from "../features/shopList/components/ShopListPage";
import { loadShopList } from "../features/shopList/hooks/useShopList";

export const Route = createFileRoute("/")({
  loader: () => loadShopList(),
  component: ShopListRoutePage,
});

function ShopListRoutePage() {
  const shops = Route.useLoaderData();
  return <ShopListPage initialShops={shops} />;
}
