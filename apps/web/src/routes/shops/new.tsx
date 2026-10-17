import { createFileRoute } from "@tanstack/react-router";
import { ShopForm } from "../../features/shop-crud/components/ShopForm";

// 店舗登録画面 (#21)
export const Route = createFileRoute("/shops/new")({
  component: ShopNewPage,
});

function ShopNewPage() {
  return <ShopForm />;
}
