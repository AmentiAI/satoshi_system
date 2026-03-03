import { headers } from "next/headers";
import { getSiteByDomain } from "@/lib/sites";
import { StoreClient } from "@/components/store/StoreClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("x-hostname") || "localhost";
  const site = await getSiteByDomain(hostname);

  if (!site) {
    return {
      title: "Rare Sats Marketplace",
      description: "Buy rare Bitcoin satoshis",
    };
  }

  return {
    title: site.metaTitle ?? site.name,
    description: site.metaDesc ?? site.description ?? `Buy ${site.name} on Bitcoin`,
    themeColor: site.primaryColor,
  };
}

export default async function StorePage() {
  const headersList = await headers();
  const hostname = headersList.get("x-hostname") || "localhost";
  const site = await getSiteByDomain(hostname);

  // Fallback site for localhost/dev
  const effectiveSite = site ?? {
    id: "dev",
    domain: hostname,
    name: "Buy Uncommon Sats",
    tagId: "86b46002-9216-4d19-9f3f-46c61c34632f",
    tagSlug: "uncommon",
    description:
      "Uncommon satoshis are the first satoshis mined in each new Bitcoin block — making them unique digital collectibles with historical significance.",
    primaryColor: "#f7931a",
    accentColor: "#0d0d0d",
    textColor: "#ffffff",
    logoUrl: null,
    faviconUrl: null,
    metaTitle: "Buy Uncommon Sats",
    metaDesc: "Shop rare uncommon Bitcoin satoshis",
    isActive: true,
  };

  return <StoreClient site={effectiveSite} />;
}
