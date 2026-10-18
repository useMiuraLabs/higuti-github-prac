import type { Shop } from "@higuti/schema";
import { useShopList } from "../hooks/useShopList";
import { ShopCard } from "./ShopCard";
import { ShopFilterBar } from "./ShopFilterBar";

type ShopListPageProps = {
  initialShops: readonly Shop[];
};

export function ShopListPage({ initialShops }: ShopListPageProps) {
  const {
    shops,
    filters,
    keywordInput,
    areaOptions,
    genreOptions,
    sortOptions,
    hasActiveFilters,
    setStatus,
    setArea,
    setGenre,
    setKeyword,
    submitKeyword,
    setSort,
    resetFilters,
  } = useShopList(initialShops);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">お店一覧</h1>
        <p className="text-sm text-muted-foreground">全 {shops.length} 件</p>
      </div>

      <ShopFilterBar
        filters={filters}
        keywordInput={keywordInput}
        areaOptions={areaOptions}
        genreOptions={genreOptions}
        sortOptions={sortOptions}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setStatus}
        onAreaChange={setArea}
        onGenreChange={setGenre}
        onKeywordChange={setKeyword}
        onKeywordSubmit={submitKeyword}
        onSortChange={setSort}
        onReset={resetFilters}
      />

      {shops.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          条件に一致するお店がありません
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
