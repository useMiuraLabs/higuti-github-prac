import type { ApiError, CreateShopInput, Shop, UpdateShopInput } from "@higuti/schema";
import { api } from "../../../lib/api";

// API がエラーを返したとき。body は ApiError の形 (読めなかったときは null)
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body?.message ?? `API error: ${status}`);
  }
}

const ensureOk = async (res: Response) => {
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as ApiError | null;
  throw new ApiRequestError(res.status, body);
};

// 見つからない (404) か ID が正しくない (400) ときは null
export const fetchShop = async (id: string): Promise<Shop | null> => {
  const res = await api.shops[":id"].$get({ param: { id } });
  if (res.status === 404 || res.status === 400) return null;
  await ensureOk(res);
  return (await res.json()) as Shop;
};

export const createShop = async (input: CreateShopInput): Promise<Shop> => {
  const res = await api.shops.$post({ json: input });
  await ensureOk(res);
  return (await res.json()) as Shop;
};

export const updateShop = async (id: number, input: UpdateShopInput): Promise<Shop> => {
  const res = await api.shops[":id"].$patch({ param: { id: String(id) }, json: input });
  await ensureOk(res);
  return (await res.json()) as Shop;
};

export const deleteShop = async (id: number) => {
  await ensureOk(await api.shops[":id"].$delete({ param: { id: String(id) } }));
};
