import "server-only";
import { getSiteByDomainFromDb } from "./db";
export { KNOWN_SAT_TAGS } from "./sat-tags";
export type { SiteConfig } from "./db";

const siteCache = new Map<string, { config: import("./db").SiteConfig | null; ts: number }>();
const CACHE_TTL = 60_000;

export async function getSiteByDomain(hostname: string): Promise<import("./db").SiteConfig | null> {
  const domain = hostname.split(":")[0];

  const cached = siteCache.get(domain);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.config;
  }

  const config = await getSiteByDomainFromDb(domain);
  siteCache.set(domain, { config, ts: Date.now() });
  return config;
}

export function clearSiteCache(domain?: string) {
  if (domain) siteCache.delete(domain);
  else siteCache.clear();
}
