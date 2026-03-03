"use client";

import { KNOWN_SAT_TAGS } from "@/lib/sat-tags";
import { SatTypeSvg } from "./SatVisual";
import type { SiteConfig } from "@/lib/sites";

const TAG_LIST = KNOWN_SAT_TAGS as unknown as Array<{
  slug: string;
  label: string;
  id: string;
  color: string;
}>;

const CATEGORIES = [
  {
    label: "Bitcoin Rarity",
    slugs: ["uncommon", "rare", "epic"],
  },
  {
    label: "Uncommon Variants",
    slugs: ["vintage-uncommon", "nakamoto-uncommon", "alpha-uncommon", "pizza-uncommon", "hitman-uncommon", "silkroad-uncommon"],
  },
  {
    label: "Palindromes",
    slugs: ["pali", "seq-pali", "vintage-pali", "2d-pali", "3d-pali", "1d-pali", "pali-block"],
  },
  {
    label: "Black Variants",
    slugs: ["black-uncommon", "black-rare", "black-epic", "black-uncommon-vintage", "nakamoto-black-uncommon", "omega-black-uncommon"],
  },
  {
    label: "Historic Blocks",
    slugs: ["b9", "b78", "b286", "b666", "b9-450"],
  },
  {
    label: "Special / Exotic",
    slugs: ["nakamoto", "vintage", "pizza", "hitman", "silkroad", "jpeg", "alpha", "omega", "trump", "legacy"],
  },
] as const;

interface Props {
  site: SiteConfig;
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => void;
  /** Compact pill mode (for mobile / top bar) */
  mode?: "sidebar" | "pills";
}

export function SatTypeFilter({ site, selectedTagId, onSelect, mode = "sidebar" }: Props) {
  const tagMap = new Map(TAG_LIST.map((t) => [t.slug, t]));

  if (mode === "pills") {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
            selectedTagId === null
              ? "bg-white/15 border-white/30"
              : "bg-transparent border-white/10 hover:border-white/20"
          }`}
          style={{ color: site.textColor }}
        >
          All Types
        </button>
        {TAG_LIST.slice(0, 14).map((tag) => (
          <TagPill
            key={tag.id}
            tag={tag}
            selected={selectedTagId === tag.id}
            onSelect={onSelect}
            textColor={site.textColor}
          />
        ))}
      </div>
    );
  }

  return (
    <aside
      className="w-64 shrink-0 rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: `${site.accentColor}99` }}
    >
      {/* All */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
            selectedTagId === null
              ? "bg-white/10 border border-white/20"
              : "hover:bg-white/5"
          }`}
          style={{ color: site.textColor }}
        >
          <span className="text-lg">⭐</span>
          All Types
        </button>
      </div>

      {/* Categories */}
      <div className="p-2 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {CATEGORIES.map((cat) => {
          const tags = cat.slugs
            .map((s) => tagMap.get(s))
            .filter(Boolean) as typeof TAG_LIST[number][];
          if (!tags.length) return null;

          return (
            <div key={cat.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 px-2 mb-1"
                style={{ color: site.textColor }}>
                {cat.label}
              </p>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onSelect(tag.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedTagId === tag.id
                      ? "bg-white/10 border border-white/15"
                      : "hover:bg-white/5 opacity-70 hover:opacity-100"
                  }`}
                  style={{ color: site.textColor }}
                >
                  <SatTypeSvg slug={tag.slug} size={24} />
                  <span className="truncate">{tag.label}</span>
                  {selectedTagId === tag.id && (
                    <div
                      className="ml-auto w-2 h-2 rounded-full shrink-0"
                      style={{ background: tag.color }}
                    />
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function TagPill({
  tag,
  selected,
  onSelect,
  textColor,
}: {
  tag: (typeof TAG_LIST)[number];
  selected: boolean;
  onSelect: (id: string) => void;
  textColor: string;
}) {
  return (
    <button
      onClick={() => onSelect(tag.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
        selected
          ? "border-transparent"
          : "bg-transparent border-white/10 hover:border-white/20 opacity-70 hover:opacity-100"
      }`}
      style={{
        color: selected ? "#fff" : textColor,
        background: selected ? tag.color : "transparent",
        borderColor: selected ? tag.color : undefined,
      }}
    >
      <SatTypeSvg slug={tag.slug} size={16} />
      {tag.label}
    </button>
  );
}
