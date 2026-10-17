import { SHOP_RATING_MAX, SHOP_STATUS_LABELS, type Shop } from "@higuti/schema";
import { Badge } from "@higuti/ui/components/Badge";
import { Card } from "@higuti/ui/components/Card";
import { Link } from "@tanstack/react-router";

type ShopCardProps = {
  shop: Shop;
};

function formatRatingStars(rating: number): string {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(Math.max(0, SHOP_RATING_MAX - rating));
  return `${filled}${empty}`;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      to="/shops/$shopId"
      params={{ shopId: String(shop.id) }}
      className="block transition-opacity hover:opacity-80"
    >
      <Card
        title={
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold">{shop.name}</span>
            <Badge variant={shop.status === "visited" ? "default" : "muted"}>
              {SHOP_STATUS_LABELS[shop.status]}
            </Badge>
          </div>
        }
        footer={
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>登録者: {shop.createdBy}</span>
            {shop.visitedAt && <span>訪問日: {shop.visitedAt}</span>}
          </div>
        }
      >
        <div className="space-y-3">
          {shop.imageUrl && (
            <img
              src={shop.imageUrl}
              alt={shop.name}
              className="h-40 w-full rounded-md object-cover"
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{shop.area}</Badge>
            <Badge variant="outline">{shop.genre}</Badge>
          </div>

          {shop.rating !== null && (
            <p className="text-sm font-medium text-amber-500" aria-label={`評価 ${shop.rating}`}>
              {formatRatingStars(shop.rating)}{" "}
              <span className="text-xs text-muted-foreground">({shop.rating})</span>
            </p>
          )}

          {shop.memo && <p className="line-clamp-2 text-sm text-muted-foreground">{shop.memo}</p>}
        </div>
      </Card>
    </Link>
  );
}
