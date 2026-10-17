import {
  SHOP_MEMBERS,
  SHOP_STATUS_LABELS,
  SHOP_STATUSES,
  type Shop,
  todayInJst,
} from "@higuti/schema";
import { Badge } from "@higuti/ui/components/Badge";
import { Button } from "@higuti/ui/components/Button";
import { Card } from "@higuti/ui/components/Card";
import { DatePickerField } from "@higuti/ui/components/DatePickerField";
import { RadioGroup } from "@higuti/ui/components/RadioGroup";
import { TextAreaField } from "@higuti/ui/components/TextAreaField";
import { TextField } from "@higuti/ui/components/TextField";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { Controller } from "react-hook-form";
import { useShopForm } from "../hooks/useShopForm";
import { RatingInput } from "./RatingInput";

type ShopFormProps = {
  shop?: Shop;
  startAsVisited?: boolean;
};

const STATUS_OPTIONS = SHOP_STATUSES.map((value) => ({ value, label: SHOP_STATUS_LABELS[value] }));
const MEMBER_OPTIONS = SHOP_MEMBERS.map((value) => ({ value, label: value }));

export function ShopForm({ shop, startAsVisited }: ShopFormProps) {
  const { form, isEdit, isVisited, reviewWillBeLost, isSubmitting, onSubmit } = useShopForm({
    shop,
    startAsVisited,
  });
  const { register, control } = form;
  const errors = form.formState.errors;
  const back = shop ? (
    <Link to="/shops/$shopId" params={{ shopId: String(shop.id) }}>
      <ChevronLeftIcon />
      詳細へ
    </Link>
  ) : (
    <Link to="/">
      <ChevronLeftIcon />
      一覧へ
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          {back}
        </Button>
      </div>
      <h1 className="text-2xl font-bold">{shop ? `「${shop.name}」を編集` : "お店を登録"}</h1>

      <form noValidate onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
        <Card title="お店の情報">
          <div className="flex flex-col gap-6">
            <TextField
              label="店名"
              placeholder="例: 〇〇珈琲店"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="エリア"
                placeholder="例: 清澄白河"
                error={errors.area?.message}
                {...register("area")}
              />
              <TextField
                label="ジャンル"
                placeholder="例: カフェ"
                error={errors.genre?.message}
                {...register("genre")}
              />
            </div>
            <TextField
              label="マップ・参考 URL（任意）"
              type="url"
              placeholder="https://"
              error={errors.mapUrl?.message}
              {...register("mapUrl")}
            />
            {isEdit ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm leading-none font-medium">登録者</span>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{shop?.createdBy}</Badge>
                  <span className="text-sm text-muted-foreground">登録者は変更できません</span>
                </div>
              </div>
            ) : (
              <Controller
                control={control}
                name="createdBy"
                render={({ field }) => (
                  <RadioGroup
                    label="登録者"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={MEMBER_OPTIONS}
                  />
                )}
              />
            )}
            <div className="flex flex-col gap-2">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <RadioGroup
                    label="ステータス"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={STATUS_OPTIONS}
                  />
                )}
              />
              {reviewWillBeLost && (
                <p className="text-sm text-destructive">
                  「行きたい」で保存すると、評価・訪問日・写真 URL が消えます（メモは残ります）
                </p>
              )}
            </div>
            <TextAreaField
              label="一言メモ（任意）"
              error={errors.memo?.message}
              {...register("memo")}
            />
          </div>
        </Card>

        {isVisited && (
          <Card title="レビュー（任意）">
            <div className="flex flex-col gap-6">
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <RatingInput value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.rating?.message && (
                <p className="text-sm text-destructive">{errors.rating.message}</p>
              )}
              <Controller
                control={control}
                name="visitedAt"
                render={({ field }) => (
                  <DatePickerField
                    label="訪問日"
                    value={field.value}
                    onChange={field.onChange}
                    max={todayInJst()}
                    error={errors.visitedAt?.message}
                  />
                )}
              />
              <TextField
                label="写真 URL"
                type="url"
                placeholder="https://"
                error={errors.imageUrl?.message}
                {...register("imageUrl")}
              />
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "保存中…" : "登録中…") : isEdit ? "保存する" : "登録する"}
          </Button>
          <Button variant="ghost" asChild>
            {shop ? (
              <Link to="/shops/$shopId" params={{ shopId: String(shop.id) }}>
                キャンセル
              </Link>
            ) : (
              <Link to="/">キャンセル</Link>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
