import { createFileRoute } from "@tanstack/react-router";

// 店舗一覧・検索画面 (#20 の担当が実装する)
export const Route = createFileRoute("/")({
  component: ShopListPage,
});

function ShopListPage() {
  return <h1 className="text-2xl font-bold">お店一覧</h1>;
}
