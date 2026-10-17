import * as v from "valibot";

// 店舗まわりで FE・BE・DB が共有する定義。選択肢や上限を変えるときはここだけを直す

export const SHOP_STATUSES = ["want_to_go", "visited"] as const;
export type ShopStatus = (typeof SHOP_STATUSES)[number];
export const SHOP_STATUS_LABELS: Record<ShopStatus, string> = {
  want_to_go: "行きたい",
  visited: "行った",
};

export const SHOP_MEMBERS = ["miura", "yuma"] as const;
export type ShopMember = (typeof SHOP_MEMBERS)[number];

export const SHOP_NAME_MAX_LENGTH = 100;
export const SHOP_AREA_MAX_LENGTH = 50;
export const SHOP_GENRE_MAX_LENGTH = 50;
export const SHOP_MEMO_MAX_LENGTH = 1000;
export const SHOP_RATING_MIN = 1;
export const SHOP_RATING_MAX = 5;

// 一覧と詳細の両方が返す形
export const shopSchema = v.object({
  id: v.number(),
  name: v.string(),
  area: v.string(),
  genre: v.string(),
  status: v.picklist(SHOP_STATUSES),
  mapUrl: v.nullable(v.string()),
  rating: v.nullable(v.number()),
  memo: v.nullable(v.string()),
  imageUrl: v.nullable(v.string()),
  visitedAt: v.nullable(v.string()),
  createdBy: v.picklist(SHOP_MEMBERS),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export type Shop = v.InferOutput<typeof shopSchema>;

// ---- 登録・更新の入力 (#21) ----

// 今日の日付 (日本時間) を YYYY-MM-DD で返す。訪問日は今日より後を受け付けない
export const todayInJst = (now = new Date()) =>
  new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

const isRealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// javascript: などをリンクや画像に入れさせないため、http(s) だけを受け付ける
const isHttpUrl = (value: string) => /^https?:\/\/[^\s/?#]+\.[^\s]*$/i.test(value);

const requiredText = (label: string, max: number) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(`${label}を入力してください`),
    v.maxLength(max, `${label}は${max}文字以内で入力してください`),
  );

// 任意の項目は、空欄で送られたら null として保存する
const emptyToNull = (value: string) => (value === "" ? null : value);

const optionalText = (label: string, max: number) =>
  v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.trim(),
        v.maxLength(max, `${label}は${max}文字以内で入力してください`),
        v.transform(emptyToNull),
      ),
    ),
  );

const optionalUrl = () =>
  v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.trim(),
        v.check(
          (value) => value === "" || isHttpUrl(value),
          "http:// か https:// で始まる URL を入力してください",
        ),
        v.transform(emptyToNull),
      ),
    ),
  );

const optionalVisitedAt = () =>
  v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.transform(emptyToNull),
        v.nullable(
          v.pipe(
            v.string(),
            v.check(isRealDate, "存在する日付を入力してください"),
            v.check((value) => value <= todayInJst(), "今日より後の日付は入力できません"),
          ),
        ),
      ),
    ),
  );

const optionalRating = () =>
  v.optional(
    v.nullable(
      v.pipe(
        v.number(),
        v.integer("評価は整数で入力してください"),
        v.minValue(
          SHOP_RATING_MIN,
          `評価は${SHOP_RATING_MIN}〜${SHOP_RATING_MAX}で入力してください`,
        ),
        v.maxValue(
          SHOP_RATING_MAX,
          `評価は${SHOP_RATING_MIN}〜${SHOP_RATING_MAX}で入力してください`,
        ),
      ),
    ),
  );

const shopInputEntries = {
  name: requiredText("店名", SHOP_NAME_MAX_LENGTH),
  area: requiredText("エリア", SHOP_AREA_MAX_LENGTH),
  genre: requiredText("ジャンル", SHOP_GENRE_MAX_LENGTH),
  status: v.picklist(SHOP_STATUSES, "ステータスを選んでください"),
  mapUrl: optionalUrl(),
  memo: optionalText("メモ", SHOP_MEMO_MAX_LENGTH),
  rating: optionalRating(),
  visitedAt: optionalVisitedAt(),
  imageUrl: optionalUrl(),
};

export const createShopSchema = v.object({
  ...shopInputEntries,
  createdBy: v.picklist(SHOP_MEMBERS, "登録者を選んでください"),
});
export type CreateShopInput = v.InferInput<typeof createShopSchema>;

// 送った項目だけを更新する。登録者は変えられないので、送られてきたら 400 にする
export const updateShopSchema = v.strictObject(
  Object.fromEntries(
    Object.entries(shopInputEntries).map(([key, schema]) => [key, v.optional(schema)]),
  ) as {
    [K in keyof typeof shopInputEntries]: v.OptionalSchema<(typeof shopInputEntries)[K], undefined>;
  },
  "変更できない項目が含まれています",
);
export type UpdateShopInput = v.InferInput<typeof updateShopSchema>;

// 評価・訪問日・写真は「行った」お店のもの
export const SHOP_REVIEW_FIELDS = ["rating", "visitedAt", "imageUrl"] as const;
export type ShopReviewField = (typeof SHOP_REVIEW_FIELDS)[number];

// 保存後のステータスが「行きたい」なのに、評価・訪問日・写真に値を入れようとしていたらエラー文を返す
export const findReviewFieldErrors = (
  status: ShopStatus,
  fields: Partial<Record<ShopReviewField, unknown>>,
): Partial<Record<ShopReviewField, string>> =>
  status === "visited"
    ? {}
    : Object.fromEntries(
        SHOP_REVIEW_FIELDS.filter((key) => fields[key] != null).map((key) => [
          key,
          "「行きたい」のお店には入力できません",
        ]),
      );

export const shopIdParamSchema = v.object({
  id: v.pipe(
    v.string(),
    v.regex(/^[1-9]\d*$/, "お店の ID が正しくありません"),
    v.transform(Number),
  ),
});
