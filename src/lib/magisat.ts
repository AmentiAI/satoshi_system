const MAGISAT_API_URL = process.env.MAGISAT_API_URL || "https://api.magisat.io";
const MAGISAT_API_KEY = process.env.MAGISAT_API_KEY || "";

async function magisatFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${MAGISAT_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-MGST-API-KEY": MAGISAT_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Magisat API error ${res.status}: ${text}`);
  }

  return res.json();
}

export interface MagisatListing {
  id: string;
  type: string;
  status: string;
  utxo: string;
  utxoValue: string;
  sellerAddress: string;
  price: string;
  utxoSize: string;
  createdAt: string;
  updatedAt: string;
  lowestSatBlockNumber: number;
  lowestSatBlockTimestamp: string;
  relativeUnitPrice: string;
  minFeeRate: number;
  minFeeTotal: number;
  specialSatsCount: string;
  sellerVerified: boolean;
  sellerDisplayName: string | null;
  mainSatoshi: {
    rangeStart: string;
    rangeEnd: string;
    name: string;
    blockNumber: number;
    blockTimestamp: string;
    sattributes: Array<{
      id: string;
      slug: string;
      color: string;
      label: string;
      priority: number;
      spendable: boolean;
    }>;
    count: number;
  };
  mainTag: {
    id: string;
    slug: string;
    label: string;
  };
  mainSecondaryTags: Array<{
    id: string;
    slug: string;
    label: string;
  }>;
  includedInCollections: Array<{
    sat: string;
    inscriptionId: string;
    displayName: string;
    s3Url: string;
    overrideS3Url: string | null;
    contentType: string;
    collectionTag: {
      id: string;
      slug: string;
      label: string;
    };
  }>;
}

export interface ListingsResponse {
  results: MagisatListing[];
  count: string;
}

export interface ListingsParams {
  tagId?: string;
  offset?: number;
  limit?: number;
  orderByColumnWithDirection?: string[];
  minPrice?: string;
  maxPrice?: string;
  includePendingPurchase?: boolean;
}

export async function getListings(params: ListingsParams): Promise<ListingsResponse> {
  return magisatFetch<ListingsResponse>("/external/v1/listing", {
    method: "POST",
    body: JSON.stringify({
      offset: params.offset ?? 0,
      limit: params.limit ?? 24,
      tagId: params.tagId,
      orderByColumnWithDirection: params.orderByColumnWithDirection ?? ["PRICE_ASC"],
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      includePendingPurchase: params.includePendingPurchase ?? false,
    }),
    next: { revalidate: 30 },
  });
}

export interface MagisatTag {
  id: string;
  label: string;
  slug: string;
  priority: number;
  description: string | null;
  totalSupply: string;
  floorPrice: string | null;
  floorRelativeUnitPrice: string | null;
  itemsCount: string;
  sattributes: Array<{
    id: string;
    slug: string;
    color: string;
    label: string;
  }>;
}

export interface TagsResponse {
  results: MagisatTag[];
}

export async function getTags(): Promise<TagsResponse> {
  return magisatFetch<TagsResponse>("/external/v1/tag", {
    method: "GET",
    next: { revalidate: 3600 },
  });
}

export async function getTagBySlug(slug: string): Promise<MagisatTag | null> {
  const res = await magisatFetch<MagisatTag>(`/external/v1/tag/${slug}`, {
    method: "GET",
    next: { revalidate: 3600 },
  });
  return res;
}

// Buying flow
export interface PreparedPsbtParams {
  buyerAddress: string;
  buyerPublicKey: string;
  feeRateTier: "fastestFee" | "halfHourFee" | "hourFee" | "minimumFee";
  listingIds: string[];
}

export async function getPreparedPsbt(params: PreparedPsbtParams) {
  const query = new URLSearchParams({
    buyerAddress: params.buyerAddress,
    buyerPublicKey: params.buyerPublicKey,
    feeRateTier: params.feeRateTier,
    listingIds: params.listingIds.join(","),
  });
  return magisatFetch(`/external/v1/psbt/prepared?${query}`, {
    method: "GET",
  });
}

export async function broadcastPrepared(psbtBase64: string) {
  return magisatFetch("/external/v1/prepared", {
    method: "POST",
    body: JSON.stringify({ psbtBase64 }),
  });
}

export interface BuyingPsbtParams {
  listings: Array<{ listingId: string; receiveAddress: string }>;
  buyerAddress: string;
  buyerPublicKey: string;
  feeRateTier: "fastestFee" | "halfHourFee" | "hourFee" | "minimumFee";
  optimizationLevel?: 0 | 1;
}

export async function getBuyingPsbt(params: BuyingPsbtParams) {
  return magisatFetch("/external/v1/psbt/buying", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      optimizationLevel: params.optimizationLevel ?? 0,
    }),
  });
}

export interface FinalizeParams {
  listings: Array<{ listingId: string; receiveAddress: string }>;
  buyerAddress: string;
  buyerPublicKey: string;
  buyerSignature: string;
  buyerWalletType: "xverse_wallet" | "unisat_wallet";
  optimizationLevel?: 0 | 1;
}

export async function finalizePurchase(params: FinalizeParams) {
  return magisatFetch("/external/v1/buying/bulk", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      optimizationLevel: params.optimizationLevel ?? 0,
    }),
  });
}

export function formatSats(sats: string | number): string {
  const n = typeof sats === "string" ? parseInt(sats) : sats;
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(4)} BTC`;
  return `${n.toLocaleString()} sats`;
}

export function formatUSD(sats: string | number, btcPrice: number = 85000): string {
  const n = typeof sats === "string" ? parseInt(sats) : sats;
  const usd = (n / 100_000_000) * btcPrice;
  if (usd < 0.01) return "< $0.01";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(usd);
}
