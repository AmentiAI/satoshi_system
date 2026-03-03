import "server-only";
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

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

// Columns are already camelCase (from Prisma migration) so rows cast directly
function row(r: unknown): SiteConfig {
  return r as SiteConfig;
}

export async function getAllSites(): Promise<SiteConfig[]> {
  const rows = await sql`SELECT * FROM "Site" ORDER BY "createdAt" ASC`;
  return rows.map(row);
}

export async function getSiteById(id: string): Promise<SiteConfig | null> {
  const rows = await sql`SELECT * FROM "Site" WHERE id = ${id} LIMIT 1`;
  return rows[0] ? row(rows[0]) : null;
}

export async function getSiteByDomainFromDb(domain: string): Promise<SiteConfig | null> {
  const rows = await sql`
    SELECT * FROM "Site" WHERE domain = ${domain} AND "isActive" = true LIMIT 1
  `;
  return rows[0] ? row(rows[0]) : null;
}

export async function createSite(data: {
  domain: string; name: string; tagId: string; tagSlug: string;
  description?: string | null; primaryColor?: string; accentColor?: string;
  textColor?: string; logoUrl?: string | null; metaTitle?: string | null;
  metaDesc?: string | null; isActive?: boolean;
}): Promise<SiteConfig> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const rows = await sql`
    INSERT INTO "Site" (
      id, domain, name, "tagId", "tagSlug", description,
      "primaryColor", "accentColor", "textColor",
      "logoUrl", "faviconUrl", "metaTitle", "metaDesc",
      "isActive", "createdAt", "updatedAt"
    ) VALUES (
      ${id}, ${data.domain}, ${data.name}, ${data.tagId}, ${data.tagSlug},
      ${data.description ?? null},
      ${data.primaryColor ?? "#f7931a"}, ${data.accentColor ?? "#0d0d0d"}, ${data.textColor ?? "#ffffff"},
      ${data.logoUrl ?? null}, ${null}, ${data.metaTitle ?? null}, ${data.metaDesc ?? null},
      ${data.isActive ?? true}, ${now}, ${now}
    )
    RETURNING *
  `;
  return row(rows[0]);
}

export async function updateSite(id: string, data: {
  domain: string; name: string; tagId: string; tagSlug: string;
  description?: string | null; primaryColor: string; accentColor: string;
  textColor: string; logoUrl?: string | null; metaTitle?: string | null;
  metaDesc?: string | null; isActive: boolean;
}): Promise<SiteConfig | null> {
  const now = new Date().toISOString();
  const rows = await sql`
    UPDATE "Site" SET
      domain        = ${data.domain},
      name          = ${data.name},
      "tagId"       = ${data.tagId},
      "tagSlug"     = ${data.tagSlug},
      description   = ${data.description ?? null},
      "primaryColor"= ${data.primaryColor},
      "accentColor" = ${data.accentColor},
      "textColor"   = ${data.textColor},
      "logoUrl"     = ${data.logoUrl ?? null},
      "metaTitle"   = ${data.metaTitle ?? null},
      "metaDesc"    = ${data.metaDesc ?? null},
      "isActive"    = ${data.isActive},
      "updatedAt"   = ${now}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? row(rows[0]) : null;
}

export async function deleteSite(id: string): Promise<SiteConfig | null> {
  const rows = await sql`DELETE FROM "Site" WHERE id = ${id} RETURNING *`;
  return rows[0] ? row(rows[0]) : null;
}
