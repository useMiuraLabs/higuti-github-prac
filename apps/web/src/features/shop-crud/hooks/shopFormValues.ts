import { SHOP_REVIEW_FIELDS, type Shop, type ShopMember, type ShopStatus } from "@higuti/schema";

// フォームが持つ値。入力欄はすべて文字列で、評価だけが数値か未評価 (null)
export type ShopFormValues = {
  name: string;
  area: string;
  genre: string;
  status: ShopStatus;
  createdBy: ShopMember;
  mapUrl: string;
  memo: string;
  rating: number | null;
  visitedAt: string;
  imageUrl: string;
};

export const emptyShopFormValues = (): ShopFormValues => ({
  name: "",
  area: "",
  genre: "",
  status: "want_to_go",
  createdBy: "miura",
  mapUrl: "",
  memo: "",
  rating: null,
  visitedAt: "",
  imageUrl: "",
});

export const shopToFormValues = (shop: Shop): ShopFormValues => ({
  name: shop.name,
  area: shop.area,
  genre: shop.genre,
  status: shop.status,
  createdBy: shop.createdBy,
  mapUrl: shop.mapUrl ?? "",
  memo: shop.memo ?? "",
  rating: shop.rating,
  visitedAt: shop.visitedAt ?? "",
  imageUrl: shop.imageUrl ?? "",
});

// 「行きたい」で保存するときはレビュー項目を空にする。
// 画面から消えた欄の値で検証エラーにならないよう、検証の前に通す
export const dropReviewIfWantToGo = (values: ShopFormValues): ShopFormValues =>
  values.status === "visited"
    ? values
    : {
        ...values,
        ...Object.fromEntries(SHOP_REVIEW_FIELDS.map((key) => [key, key === "rating" ? null : ""])),
      };
