"use client";

/**
 * Renders the appropriate visual for a sat based on its type.
 * For inscribed sats, shows the ordinal image.
 * For non-inscribed sats, renders a type-specific SVG.
 */
import type { MagisatListing } from "@/lib/magisat";

interface Props {
  listing: MagisatListing;
  size?: number;
  className?: string;
}

export function SatVisual({ listing, size = 64, className = "" }: Props) {
  const collection =
    listing.includedInCollections?.length > 0
      ? listing.includedInCollections[0]
      : null;

  if (collection) {
    const imgUrl = collection.overrideS3Url ?? collection.s3Url;
    const isImage =
      !collection.contentType || collection.contentType.startsWith("image/");

    if (isImage && imgUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={collection.displayName ?? "Sat inscription"}
          width={size}
          height={size}
          className={`object-contain rounded-lg ${className}`}
          style={{ width: size, height: size }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }
  }

  // No inscription image — render type-specific SVG
  const slug = listing.mainSatoshi?.sattributes?.[0]?.slug ?? listing.mainTag?.slug ?? "uncommon";
  return <SatTypeSvg slug={slug} size={size} className={className} />;
}

interface SvgProps {
  slug: string;
  size: number;
  className?: string;
}

const STATIC_IMAGES: Record<string, string> = {
  uncommon: "/Sat%20PFP/uncommon%20sat.png",
  rare:     "/Sat%20PFP/Rare%20Sat.png",
  alpha:    "/Sat%20PFP/Rare%20Alpha%20Sat.png",
};

export function SatTypeSvg({ slug, size, className = "" }: SvgProps) {
  const staticImg = STATIC_IMAGES[slug];
  if (staticImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={staticImg}
        alt={slug}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const s = size;
  const half = s / 2;

  const configs: Record<string, {
    bg: string; fgA: string; fgB: string;
    symbol: string; shape: "circle" | "diamond" | "hex" | "shield";
  }> = {
    uncommon:       { bg: "#f7931a", fgA: "#ff6b00", fgB: "#ffd700", symbol: "U", shape: "circle" },
    rare:           { bg: "#24187a", fgA: "#3b28b0", fgB: "#7c3aed", symbol: "R", shape: "diamond" },
    epic:           { bg: "#003f00", fgA: "#065f46", fgB: "#10b981", symbol: "E", shape: "hex" },
    "black-uncommon":{ bg: "#111", fgA: "#222", fgB: "#555", symbol: "U", shape: "circle" },
    "black-rare":   { bg: "#111", fgA: "#222", fgB: "#444", symbol: "R", shape: "diamond" },
    "black-epic":   { bg: "#111", fgA: "#222", fgB: "#333", symbol: "E", shape: "hex" },
    pali:           { bg: "#7c3aed", fgA: "#6d28d9", fgB: "#a78bfa", symbol: "∞", shape: "circle" },
    "seq-pali":     { bg: "#5b21b6", fgA: "#4c1d95", fgB: "#8b5cf6", symbol: "∞", shape: "circle" },
    "vintage-pali": { bg: "#78350f", fgA: "#92400e", fgB: "#fbbf24", symbol: "∞", shape: "circle" },
    "2d-pali":      { bg: "#4c1d95", fgA: "#5b21b6", fgB: "#a78bfa", symbol: "∞", shape: "diamond" },
    "3d-pali":      { bg: "#3b0764", fgA: "#4c1d95", fgB: "#c084fc", symbol: "∞", shape: "diamond" },
    "1d-pali":      { bg: "#581c87", fgA: "#6b21a8", fgB: "#e879f9", symbol: "∞", shape: "diamond" },
    vintage:        { bg: "#78350f", fgA: "#92400e", fgB: "#d97706", symbol: "V", shape: "circle" },
    "vintage-uncommon": { bg: "#92400e", fgA: "#b45309", fgB: "#fbbf24", symbol: "V·U", shape: "circle" },
    nakamoto:       { bg: "#1e3a5f", fgA: "#1d4ed8", fgB: "#60a5fa", symbol: "S", shape: "shield" },
    "nakamoto-uncommon": { bg: "#1e3a5f", fgA: "#2563eb", fgB: "#93c5fd", symbol: "S·U", shape: "shield" },
    "alpha-uncommon": { bg: "#064e3b", fgA: "#065f46", fgB: "#34d399", symbol: "αU", shape: "circle" },
    alpha:          { bg: "#064e3b", fgA: "#065f46", fgB: "#34d399", symbol: "α", shape: "circle" },
    omega:          { bg: "#083344", fgA: "#0c4a6e", fgB: "#38bdf8", symbol: "Ω", shape: "circle" },
    pizza:          { bg: "#7f1d1d", fgA: "#991b1b", fgB: "#f87171", symbol: "🍕", shape: "circle" },
    "pizza-uncommon": { bg: "#7f1d1d", fgA: "#991b1b", fgB: "#fca5a5", symbol: "🍕·U", shape: "circle" },
    hitman:         { bg: "#1c1c1c", fgA: "#292929", fgB: "#e11d48", symbol: "H", shape: "hex" },
    "hitman-uncommon": { bg: "#1c1c1c", fgA: "#292929", fgB: "#fb7185", symbol: "H·U", shape: "hex" },
    silkroad:       { bg: "#1f2937", fgA: "#374151", fgB: "#9ca3af", symbol: "SR", shape: "hex" },
    "silkroad-uncommon": { bg: "#1f2937", fgA: "#374151", fgB: "#d1d5db", symbol: "SR·U", shape: "hex" },
    jpeg:           { bg: "#831843", fgA: "#9d174d", fgB: "#f472b6", symbol: "JPG", shape: "circle" },
    trump:          { bg: "#7f1d1d", fgA: "#991b1b", fgB: "#fbbf24", symbol: "T", shape: "shield" },
    b9:             { bg: "#1c1c1c", fgA: "#292929", fgB: "#f59e0b", symbol: "9", shape: "diamond" },
    b78:            { bg: "#1c1c1c", fgA: "#292929", fgB: "#f59e0b", symbol: "78", shape: "diamond" },
    b286:           { bg: "#1c1c1c", fgA: "#292929", fgB: "#f59e0b", symbol: "286", shape: "diamond" },
    b666:           { bg: "#3b0000", fgA: "#4a0000", fgB: "#ef4444", symbol: "666", shape: "diamond" },
  };

  const cfg = configs[slug] ?? configs["uncommon"];

  if (cfg.shape === "diamond") {
    const pts = `${half},${s * 0.05} ${s * 0.95},${half} ${half},${s * 0.95} ${s * 0.05},${half}`;
    return (
      <svg width={s} height={s} className={className} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <linearGradient id={`dg-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.fgA} />
            <stop offset="100%" stopColor={cfg.fgB} />
          </linearGradient>
        </defs>
        <polygon points={pts} fill={`url(#dg-${slug})`} opacity="0.9" />
        <polygon points={pts} fill="none" stroke={cfg.fgB} strokeWidth="1" opacity="0.4" />
        <text
          x={half} y={half + s * 0.08}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={s * 0.25} fontWeight="bold" fill="white" opacity="0.9"
          fontFamily="system-ui, sans-serif"
        >
          {cfg.symbol}
        </text>
      </svg>
    );
  }

  if (cfg.shape === "hex") {
    const r = s * 0.42;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg width={s} height={s} className={className} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <linearGradient id={`hg-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.fgA} />
            <stop offset="100%" stopColor={cfg.fgB} />
          </linearGradient>
        </defs>
        <polygon points={pts} fill={`url(#hg-${slug})`} opacity="0.9" />
        <polygon points={pts} fill="none" stroke={cfg.fgB} strokeWidth="1" opacity="0.3" />
        <text
          x={half} y={half + s * 0.06}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={s * 0.22} fontWeight="bold" fill="white" opacity="0.9"
          fontFamily="system-ui, sans-serif"
        >
          {cfg.symbol}
        </text>
      </svg>
    );
  }

  if (cfg.shape === "shield") {
    const path = `M ${half} ${s * 0.05}
      L ${s * 0.9} ${s * 0.2}
      L ${s * 0.9} ${s * 0.55}
      Q ${s * 0.9} ${s * 0.8} ${half} ${s * 0.95}
      Q ${s * 0.1} ${s * 0.8} ${s * 0.1} ${s * 0.55}
      L ${s * 0.1} ${s * 0.2} Z`;
    return (
      <svg width={s} height={s} className={className} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <linearGradient id={`sg-${slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cfg.fgA} />
            <stop offset="100%" stopColor={cfg.fgB} />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#sg-${slug})`} opacity="0.9" />
        <path d={path} fill="none" stroke={cfg.fgB} strokeWidth="1" opacity="0.3" />
        <text
          x={half} y={half + s * 0.08}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={s * 0.25} fontWeight="bold" fill="white" opacity="0.9"
          fontFamily="system-ui, sans-serif"
        >
          {cfg.symbol}
        </text>
      </svg>
    );
  }

  // Default: circle
  return (
    <svg width={s} height={s} className={className} viewBox={`0 0 ${s} ${s}`}>
      <defs>
        <radialGradient id={`cg-${slug}`} cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor={cfg.fgB} />
          <stop offset="100%" stopColor={cfg.bg} />
        </radialGradient>
      </defs>
      <circle cx={half} cy={half} r={s * 0.45} fill={`url(#cg-${slug})`} opacity="0.95" />
      <circle cx={half} cy={half} r={s * 0.45} fill="none" stroke={cfg.fgB} strokeWidth="1" opacity="0.3" />
      <text
        x={half} y={half + s * 0.06}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={cfg.symbol.length > 2 ? s * 0.18 : s * 0.28}
        fontWeight="bold" fill="white" opacity="0.95"
        fontFamily="system-ui, sans-serif"
      >
        {cfg.symbol}
      </text>
    </svg>
  );
}
