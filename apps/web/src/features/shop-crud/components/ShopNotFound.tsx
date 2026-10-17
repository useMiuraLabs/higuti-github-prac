import { Button } from "@higuti/ui/components/Button";
import { Card } from "@higuti/ui/components/Card";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export function ShopNotFound() {
  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card
        title="お店が見つかりません"
        footer={
          <Button variant="secondary" asChild>
            <Link to="/">
              <ChevronLeftIcon />
              一覧に戻る
            </Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          削除されたか、URL が間違っている可能性があります。
        </p>
      </Card>
    </div>
  );
}
