import {
  SHOP_SORT_LABELS,
  SHOP_SORT_ORDERS,
  type Shop,
  type ShopListQuery,
  type ShopSortOrder,
  type ShopStatus,
} from "@higuti/schema";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export const KEYWORD_DEBOUNCE_MS = 3000;

export type ShopFilterState = {
  status: "" | ShopStatus;
  area: string;
  genre: string;
  keyword: string;
  sort: ShopSortOrder;
};

const INITIAL_FILTERS: ShopFilterState = {
  status: "",
  area: "",
  genre: "",
  keyword: "",
  sort: "created_desc",
};

const SORT_OPTIONS = SHOP_SORT_ORDERS.map((order) => ({
  value: order,
  label: SHOP_SORT_LABELS[order],
}));

export async function loadShopList(query: ShopListQuery = {}): Promise<Shop[]> {
  try {
    const res = await api.shops.$get({ query });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch {
    return [];
  }
}

export function filterAndSortShops(shops: readonly Shop[], filters: ShopFilterState): Shop[] {
  const trimmedArea = filters.area.trim();
  const trimmedGenre = filters.genre.trim();
  const trimmedKeyword = filters.keyword.trim().toLowerCase();

  const filtered = shops.filter((shop) => {
    if (filters.status && shop.status !== filters.status) {
      return false;
    }
    if (trimmedArea && !shop.area.includes(trimmedArea)) {
      return false;
    }
    if (trimmedGenre && !shop.genre.includes(trimmedGenre)) {
      return false;
    }
    if (trimmedKeyword) {
      const matchesName = shop.name.toLowerCase().includes(trimmedKeyword);
      const matchesMemo = (shop.memo ?? "").toLowerCase().includes(trimmedKeyword);
      if (!matchesName && !matchesMemo) {
        return false;
      }
    }
    return true;
  });

  return filtered.toSorted((a, b) => {
    if (filters.sort === "rating_desc") {
      if (a.rating === null && b.rating !== null) return 1;
      if (a.rating !== null && b.rating === null) return -1;
      if (a.rating !== null && b.rating !== null && a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return b.id - a.id;
    }

    if (filters.sort === "visited_desc") {
      if (a.visitedAt === null && b.visitedAt !== null) return 1;
      if (a.visitedAt !== null && b.visitedAt === null) return -1;
      if (a.visitedAt !== null && b.visitedAt !== null && a.visitedAt !== b.visitedAt) {
        return b.visitedAt.localeCompare(a.visitedAt);
      }
      return b.id - a.id;
    }

    if (a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return b.id - a.id;
  });
}

export function useShopList(initialShops: readonly Shop[]) {
  const [filters, setFilters] = useState<ShopFilterState>(INITIAL_FILTERS);
  const [keywordInput, setKeywordInput] = useState("");
  const [remoteResult, setRemoteResult] = useState<{
    baseShops: readonly Shop[];
    shops: readonly Shop[];
  } | null>(null);

  // フリーワード入力が止まってから 3 秒後に検索条件へ反映する
  useEffect(() => {
    if (keywordInput === filters.keyword) {
      return;
    }

    const timerId = setTimeout(() => {
      setFilters((prev) =>
        prev.keyword === keywordInput ? prev : { ...prev, keyword: keywordInput },
      );
    }, KEYWORD_DEBOUNCE_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [keywordInput, filters.keyword]);

  const hasAppliedFilters =
    filters.status !== "" ||
    filters.area !== "" ||
    filters.genre !== "" ||
    filters.keyword.trim() !== "" ||
    filters.sort !== "created_desc";

  const hasActiveFilters = hasAppliedFilters || keywordInput.trim() !== "";

  useEffect(() => {
    if (!hasAppliedFilters) {
      return;
    }

    let cancelled = false;
    const query: ShopListQuery = {
      status: filters.status || undefined,
      area: filters.area.trim() || undefined,
      genre: filters.genre.trim() || undefined,
      keyword: filters.keyword.trim() || undefined,
      sort: filters.sort,
    };

    void api.shops
      .$get({ query })
      .then(async (res) => {
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setRemoteResult({ baseShops: initialShops, shops: data });
          }
        }
      })
      .catch(() => {
        // テスト環境等でサーバー未起動の場合は initialShops ベースの絞り込み結果を使う
      });

    return () => {
      cancelled = true;
    };
  }, [
    initialShops,
    filters.status,
    filters.area,
    filters.genre,
    filters.keyword,
    filters.sort,
    hasAppliedFilters,
  ]);

  const areas = Array.from(new Set(initialShops.map((shop) => shop.area))).toSorted();
  const areaOptions = [
    { value: "", label: "すべてのエリア" },
    ...areas.map((area) => ({ value: area, label: area })),
  ];

  const genres = Array.from(new Set(initialShops.map((shop) => shop.genre))).toSorted();
  const genreOptions = [
    { value: "", label: "すべてのジャンル" },
    ...genres.map((genre) => ({ value: genre, label: genre })),
  ];

  const activeSource =
    hasAppliedFilters && remoteResult?.baseShops === initialShops
      ? remoteResult.shops
      : initialShops;
  const shops = filterAndSortShops(activeSource, filters);

  const setStatus = (status: "" | ShopStatus) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const setArea = (area: string) => {
    setFilters((prev) => ({ ...prev, area }));
  };

  const setGenre = (genre: string) => {
    setFilters((prev) => ({ ...prev, genre }));
  };

  const setKeyword = (keyword: string) => {
    setKeywordInput(keyword);
  };

  const submitKeyword = () => {
    setFilters((prev) =>
      prev.keyword === keywordInput ? prev : { ...prev, keyword: keywordInput },
    );
  };

  const setSort = (sort: ShopSortOrder) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const resetFilters = () => {
    setKeywordInput("");
    setFilters(INITIAL_FILTERS);
    setRemoteResult(null);
  };

  return {
    shops,
    filters,
    keywordInput,
    areaOptions,
    genreOptions,
    sortOptions: SORT_OPTIONS,
    hasActiveFilters,
    setStatus,
    setArea,
    setGenre,
    setKeyword,
    submitKeyword,
    setSort,
    resetFilters,
  };
}
