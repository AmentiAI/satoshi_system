// Server-only BTC price fetcher
const PLATFORM_FEE_USD = 3;

let cachedPrice: { usd: number; ts: number } | null = null;
const PRICE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getBtcPriceUSD(): Promise<number> {
  if (cachedPrice && Date.now() - cachedPrice.ts < PRICE_TTL) {
    return cachedPrice.usd;
  }

  try {
    const res = await fetch("https://mempool.space/api/v1/prices", {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("price fetch failed");
    const data = await res.json();
    const price = data.USD as number;
    cachedPrice = { usd: price, ts: Date.now() };
    return price;
  } catch {
    // Fallback to a conservative estimate
    return cachedPrice?.usd ?? 85000;
  }
}

/**
 * Returns the $3 platform fee in satoshis at the current BTC price.
 * Minimum 2000 sats (~$0.17 at $85k), maximum 10000 sats.
 */
export async function getPlatformFeeSats(): Promise<number> {
  const btcPrice = await getBtcPriceUSD();
  const feeSats = Math.ceil((PLATFORM_FEE_USD / btcPrice) * 100_000_000);
  // Clamp to sensible range
  return Math.max(2000, Math.min(feeSats, 10000));
}
