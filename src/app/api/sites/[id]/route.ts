import { NextRequest, NextResponse } from "next/server";
import { getSiteById, updateSite, deleteSite } from "@/lib/db";
import { clearSiteCache } from "@/lib/sites";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await getSiteById(id);
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
    const site = await updateSite(id, {
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
    });
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
    clearSiteCache(site.domain);
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
    const site = await deleteSite(id);
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
    clearSiteCache(site.domain);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
