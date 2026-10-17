import { createShopSchema, type CreateShopInput, type Shop } from "@higuti/schema";
import { toast } from "@higuti/ui/components/Toast";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { ApiRequestError, createShop, updateShop } from "../api/shops";
import {
  dropReviewIfWantToGo,
  emptyShopFormValues,
  type ShopFormValues,
  shopToFormValues,
} from "./shopFormValues";

const baseResolver = valibotResolver(createShopSchema) as unknown as Resolver<
  ShopFormValues,
  unknown,
  CreateShopInput
>;
const resolver: Resolver<ShopFormValues, unknown, CreateShopInput> = (values, context, options) =>
  baseResolver(dropReviewIfWantToGo(values), context, options);

type Options = {
  // 編集のときは元の店。登録のときは undefined
  shop?: Shop;
  // 詳細の「行った！に変更してレビューを書く」から来たとき
  startAsVisited?: boolean;
};

export function useShopForm({ shop, startAsVisited = false }: Options) {
  const router = useRouter();
  const navigate = useNavigate();
  const defaultValues = shop ? shopToFormValues(shop) : emptyShopFormValues();
  if (startAsVisited) defaultValues.status = "visited";

  const form = useForm<ShopFormValues, unknown, CreateShopInput>({ resolver, defaultValues });
  const status = useWatch({ control: form.control, name: "status" });
  const hadReview =
    shop?.status === "visited" &&
    (shop.rating != null || shop.visitedAt != null || shop.imageUrl != null);

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      const { createdBy, ...rest } = input;
      const saved = shop
        ? await updateShop(shop.id, rest)
        : await createShop({ ...rest, createdBy });
      await router.invalidate();
      await navigate({ to: "/shops/$shopId", params: { shopId: String(saved.id) } });
    } catch (error) {
      const fieldErrors = error instanceof ApiRequestError ? error.body?.fieldErrors : undefined;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        for (const [key, message] of Object.entries(fieldErrors))
          form.setError(key as keyof ShopFormValues, { message });
        return;
      }
      toast.error("保存できませんでした。もう一度お試しください");
    }
  });

  return {
    form,
    isEdit: shop != null,
    isVisited: status === "visited",
    // 「行った」の店を「行きたい」に切り替えた。保存するとレビューが消えることを知らせる
    reviewWillBeLost: hadReview && status === "want_to_go",
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
  };
}
