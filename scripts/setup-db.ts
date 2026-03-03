import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

await sql`
  CREATE TABLE IF NOT EXISTS "Site" (
    id          TEXT PRIMARY KEY,
    domain      TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    "tagId"     TEXT NOT NULL,
    "tagSlug"   TEXT NOT NULL,
    description TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#f7931a',
    "accentColor"  TEXT NOT NULL DEFAULT '#0d0d0d',
    "textColor"    TEXT NOT NULL DEFAULT '#ffffff',
    "logoUrl"   TEXT,
    "faviconUrl" TEXT,
    "metaTitle" TEXT,
    "metaDesc"  TEXT,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

console.log("✓ Site table ready");
