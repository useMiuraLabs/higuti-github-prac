import {
  SHOP_STATUSES,
  SHOP_STATUS_LABELS,
  type ShopSortOrder,
  type ShopStatus,
} from "@higuti/schema";
import { Button } from "@higuti/ui/components/Button";
import { SelectField } from "@higuti/ui/components/SelectField";
import { TextField } from "@higuti/ui/components/TextField";
import type { ShopFilterState } from "../hooks/useShopList";

type Option = {
  value: string;
  label: string;
};

type ShopFilterBarProps = {
  filters: ShopFilterState;
  keywordInput: string;
  areaOptions: readonly Option[];
  genreOptions: readonly Option[];
  sortOptions: readonly Option[];
  hasActiveFilters: boolean;
  onStatusChange: (status: "" | ShopStatus) => void;
  onAreaChange: (area: string) => void;
  onGenreChange: (genre: string) => void;
  onKeywordChange: (keyword: string) => void;
  onKeywordSubmit: () => void;
  onSortChange: (sort: ShopSortOrder) => void;
  onReset: () => void;
};

const STATUS_TABS: readonly { value: "" | ShopStatus; label: string }[] = [
  { value: "", label: "すべて" },
  ...SHOP_STATUSES.map((status) => ({
    value: status,
    label: SHOP_STATUS_LABELS[status],
  })),
];

export function ShopFilterBar({
  filters,
  keywordInput,
  areaOptions,
  genreOptions,
  sortOptions,
  hasActiveFilters,
  onStatusChange,
  onAreaChange,
  onGenreChange,
  onKeywordChange,
  onKeywordSubmit,
  onSortChange,
  onReset,
}: ShopFilterBarProps) {
  return (
    <section aria-label="検索・絞り込み条件" className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <fieldset aria-label="ステータス絞り込み" className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const isSelected = filters.status === tab.value;
            return (
              <Button
                key={tab.label}
                type="button"
                variant={isSelected ? "primary" : "secondary"}
                size="sm"
                aria-pressed={isSelected}
                onClick={() => onStatusChange(tab.value)}
              >
                {tab.label}
              </Button>
            );
          })}
        </fieldset>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            条件をクリア
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onKeywordSubmit();
          }}
          className="flex items-end gap-2"
        >
          <div className="min-w-0 flex-1">
            <TextField
              label="フリーワード"
              type="search"
              placeholder="店名・メモで検索"
              value={keywordInput}
              onChange={(e) => onKeywordChange(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            検索
          </Button>
        </form>
        <SelectField
          label="エリア"
          options={areaOptions}
          value={filters.area}
          onChange={(e) => onAreaChange(e.target.value)}
        />
        <SelectField
          label="ジャンル"
          options={genreOptions}
          value={filters.genre}
          onChange={(e) => onGenreChange(e.target.value)}
        />
        <SelectField
          label="並び替え"
          options={sortOptions}
          value={filters.sort}
          onChange={(e) => onSortChange(e.target.value as ShopSortOrder)}
        />
      </div>
    </section>
  );
}
