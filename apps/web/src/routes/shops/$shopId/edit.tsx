import { createFileRoute } from "@tanstack/react-router";

// 店舗編集画面 (#21 の担当が実装する)
export const Route = createFileRoute("/shops/$shopId/edit")({
  component: ShopEditPage,
});

function ShopEditPage() {
  return <h1 className="text-2xl font-bold">お店を編集</h1>;
}
