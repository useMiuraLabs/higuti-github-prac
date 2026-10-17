import { createFileRoute } from "@tanstack/react-router";

// 店舗登録画面 (#21 の担当が実装する)
export const Route = createFileRoute("/shops/new")({
  component: ShopNewPage,
});

function ShopNewPage() {
  return <h1 className="text-2xl font-bold">お店を登録</h1>;
}
