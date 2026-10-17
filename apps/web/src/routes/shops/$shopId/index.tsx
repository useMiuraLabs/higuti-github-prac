import { createFileRoute } from "@tanstack/react-router";

// 店舗詳細・レビュー画面 (#21 の担当が実装する)
export const Route = createFileRoute("/shops/$shopId/")({
  component: ShopDetailPage,
});

function ShopDetailPage() {
  return <h1 className="text-2xl font-bold">お店の詳細</h1>;
}
