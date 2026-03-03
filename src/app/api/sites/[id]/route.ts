import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSiteCache } from "@/lib/sites";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await db.site.findUnique({ where: { id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(site);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const site = await db.site.update({
      where: { id },
      data: {
        domain: body.domain,
        name: body.name,
        tagId: body.tagId,
        tagSlug: body.tagSlug,
        description: body.description,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        textColor: body.textColor,
        logoUrl: body.logoUrl,
        metaTitle: body.metaTitle,
        metaDesc: body.metaDesc,
        isActive: body.isActive,
      },
    });
    clearSiteCache(body.domain);
    return NextResponse.json(site);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const site = await db.site.delete({ where: { id } });
    clearSiteCache(site.domain);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
