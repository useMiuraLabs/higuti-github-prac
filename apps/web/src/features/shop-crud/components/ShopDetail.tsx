import { SHOP_STATUS_LABELS, type Shop } from "@higuti/schema";
import { Badge } from "@higuti/ui/components/Badge";
import { Button } from "@higuti/ui/components/Button";
import { Card } from "@higuti/ui/components/Card";
import { ConfirmDialog } from "@higuti/ui/components/ConfirmDialog";
import { Rating } from "@higuti/ui/components/Rating";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useDeleteShop } from "../hooks/useDeleteShop";
import { ShopPhoto } from "./ShopPhoto";

type ShopDetailProps = {
  shop: Shop;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

const Empty = ({ children }: { children: ReactNode }) => (
  <span className="text-muted-foreground">{children}</span>
);

export function ShopDetail({ shop }: ShopDetailProps) {
  const deletion = useDeleteShop(shop);
  const visited = shop.status === "visited";
  const shopId = String(shop.id);
  const memo = shop.memo ?? <Empty>なし</Empty>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ChevronLeftIcon />
            一覧へ
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={visited ? "default" : "outline"}>
              {SHOP_STATUS_LABELS[shop.status]}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-4" aria-hidden />
              {shop.area} ・ {shop.genre}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{shop.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/shops/$shopId/edit" params={{ shopId }}>
              <PencilIcon />
              編集
            </Link>
          </Button>
          <Button variant="danger" size="sm" onClick={() => deletion.setOpen(true)}>
            <Trash2Icon />
            削除
          </Button>
        </div>
      </div>

      {!visited && (
        <Card
          title="まだ行っていないお店です"
          footer={
            <Button size="lg" asChild>
              <Link to="/shops/$shopId/edit" params={{ shopId }} search={{ status: "visited" }}>
                行った！に変更してレビューを書く
              </Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">行ったら、評価や感想を残しましょう</p>
        </Card>
      )}

      {visited && (
        <Card title="レビュー">
          <div className="flex flex-col gap-4">
            {shop.imageUrl && <ShopPhoto src={shop.imageUrl} alt={`${shop.name}の写真`} />}
            <dl className="divide-y">
              <Row label="評価">
                <Rating value={shop.rating} />
              </Row>
              <Row label="訪問日">{shop.visitedAt ?? <Empty>未入力</Empty>}</Row>
              <Row label="メモ">{memo}</Row>
            </dl>
          </div>
        </Card>
      )}

      <Card title="お店の情報">
        <dl className="divide-y">
          <Row label="エリア">{shop.area}</Row>
          <Row label="ジャンル">{shop.genre}</Row>
          {!visited && <Row label="メモ">{memo}</Row>}
          <Row label="参考 URL">
            {shop.mapUrl ? (
              <Button variant="secondary" size="sm" asChild>
                <a href={shop.mapUrl} target="_blank" rel="noopener noreferrer">
                  地図・参考サイトを開く
                  <ExternalLinkIcon />
                </a>
              </Button>
            ) : (
              <Empty>なし</Empty>
            )}
          </Row>
          <Row label="登録者">
            <Badge variant="muted">{shop.createdBy}</Badge>
          </Row>
        </dl>
      </Card>

      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title={`「${shop.name}」を削除しますか？`}
        description="削除すると元に戻せません。"
        confirmLabel={deletion.pending ? "削除中…" : "削除する"}
        onConfirm={deletion.confirm}
        pending={deletion.pending}
        danger
      />
    </div>
  );
}
