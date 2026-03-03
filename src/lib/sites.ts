// Server-only module — do NOT import in client components
import "server-only";
import { db } from "./db";
export { KNOWN_SAT_TAGS } from "./sat-tags";

export interface SiteConfig {
  id: string;
  domain: string;
  name: string;
  tagId: string;
  tagSlug: string;
  description: string | null;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  isActive: boolean;
}

// In-memory cache to reduce DB round-trips
const siteCache = new Map<string, { config: SiteConfig | null; ts: number }>();
const CACHE_TTL = 60_000;

export async function getSiteByDomain(hostname: string): Promise<SiteConfig | null> {
  const domain = hostname.split(":")[0];

  const cached = siteCache.get(domain);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.config;
  }

  const site = await db.site.findFirst({
    where: { domain, isActive: true },
  });

  siteCache.set(domain, { config: site, ts: Date.now() });
  return site;
}

export function clearSiteCache(domain?: string) {
  if (domain) siteCache.delete(domain);
  else siteCache.clear();
}
