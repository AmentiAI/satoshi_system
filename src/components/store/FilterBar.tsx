"use client";

import type { SiteConfig } from "@/lib/sites";

interface SortOption {
  value: string;
  label: string;
}

interface Props {
  site: SiteConfig;
  sort: string;
  onSortChange: (val: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  count: number;
  loading: boolean;
  sortOptions?: SortOption[];
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: "PRICE_ASC", label: "Price: Low → High" },
  { value: "PRICE_DESC", label: "Price: High → Low" },
  { value: "UPDATED_AT_DESC", label: "Recently Listed" },
  { value: "BLOCK_NUMBER_ASC", label: "Oldest Block" },
  { value: "BLOCK_NUMBER_DESC", label: "Newest Block" },
];

export function FilterBar({
  site,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  count,
  loading,
  sortOptions = DEFAULT_SORT_OPTIONS,
}: Props) {
  const inputClass =
    "bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-white/30 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl border border-white/10"
         style={{ background: `${site.accentColor}88` }}>
      <span className="text-sm font-semibold opacity-50" style={{ color: site.textColor }}>
        {loading ? "Loading…" : `${count.toLocaleString()} listing${count !== 1 ? "s" : ""}`}
      </span>

      <div className="flex-1" />

      {/* Price range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min sats"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className={inputClass}
          style={{ color: site.textColor, width: 120 }}
        />
        <span className="text-sm opacity-30" style={{ color: site.textColor }}>–</span>
        <input
          type="number"
          placeholder="Max sats"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className={inputClass}
          style={{ color: site.textColor, width: 120 }}
        />
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className={inputClass}
        style={{ color: site.textColor }}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-gray-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
