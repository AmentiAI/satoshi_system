import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSiteCache } from "@/lib/sites";

export async function GET() {
  const sites = await db.site.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const site = await db.site.create({
      data: {
        domain: body.domain,
        name: body.name,
        tagId: body.tagId,
        tagSlug: body.tagSlug,
        description: body.description ?? null,
        primaryColor: body.primaryColor ?? "#f7931a",
        accentColor: body.accentColor ?? "#0d0d0d",
        textColor: body.textColor ?? "#ffffff",
        logoUrl: body.logoUrl ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDesc: body.metaDesc ?? null,
        isActive: body.isActive ?? true,
      },
    });
    clearSiteCache(body.domain);
    return NextResponse.json(site, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
