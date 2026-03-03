"use client";

import type { MagisatListing } from "@/lib/magisat";
import { formatSatsDisplay, formatBlockNumber, timeAgo } from "@/lib/utils";
import type { SiteConfig } from "@/lib/sites";
import { SatVisual } from "./SatVisual";

interface Props {
  listing: MagisatListing;
  site: SiteConfig;
  onBuy: (listing: MagisatListing) => void;
}

export function ListingCard({ listing, site, onBuy }: Props) {
  const sats = listing.mainSatoshi;
  const attrs = sats?.sattributes ?? [];
  const attr = attrs[0];
  const tagColor = attr?.color ?? site.primaryColor;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer flex flex-col"
      style={{ background: `${site.accentColor}dd` }}
      onClick={() => onBuy(listing)}
    >
      {/* Visual panel */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 200,
          background: `linear-gradient(135deg, ${tagColor}22 0%, ${tagColor}08 100%)`,
        }}
      >
        <SatVisual listing={listing} size={110} />

        {/* Sat name watermark */}
        {sats?.name && (
          <div
            className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono opacity-30 px-1 truncate"
            style={{ color: site.textColor }}
          >
            {sats.name}
          </div>
        )}

        {/* Type badge */}
        {attr && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
            style={{ background: tagColor, color: "#fff" }}
          >
            {attr.label}
          </div>
        )}

        {/* Multiple attrs badge */}
        {attrs.length > 1 && (
          <div className="absolute top-2 right-2 flex gap-1">
            {attrs.slice(1, 3).map((a) => (
              <div
                key={a.slug}
                className="w-2 h-2 rounded-full border border-white/20"
                title={a.label}
                style={{ background: a.color ?? "#888" }}
              />
            ))}
          </div>
        )}

        {/* Verified badge */}
        {listing.sellerVerified && (
          <div
            className={`absolute ${attrs.length > 1 ? "top-8" : "top-2"} right-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30`}
          >
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1" style={{ color: site.textColor }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">
              {listing.mainTag?.label ?? "Rare Sat"}
              {listing.mainSecondaryTags?.length > 0 && (
                <span className="opacity-40 ml-1 text-xs">
                  +{listing.mainSecondaryTags.length}
                </span>
              )}
            </p>
            <p className="text-xs opacity-40 mt-0.5 font-mono">
              Block {formatBlockNumber(sats?.blockNumber ?? listing.lowestSatBlockNumber)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm" style={{ color: tagColor }}>
              {formatSatsDisplay(listing.price)}
            </p>
            {listing.relativeUnitPrice && parseInt(listing.relativeUnitPrice) > 0 && (
              <p className="text-[11px] opacity-35 mt-0.5">
                {parseInt(listing.relativeUnitPrice).toLocaleString()} s/s
              </p>
            )}
          </div>
        </div>

        {/* Sat count */}
        {sats?.count && sats.count > 1 && (
          <div className="text-xs opacity-40">{sats.count.toLocaleString()} sats in UTXO</div>
        )}

        {/* Listed time */}
        <div className="text-xs opacity-25 mt-auto">{timeAgo(listing.updatedAt)}</div>

        {/* Buy button */}
        <button
          className="w-full mt-2 py-2 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-95"
          style={{ background: tagColor, color: "#fff" }}
          onClick={(e) => {
            e.stopPropagation();
            onBuy(listing);
          }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
