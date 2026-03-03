import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteForm } from "@/components/admin/SiteForm";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSitePage({ params }: Props) {
  const { id } = await params;
  const site = await db.site.findUnique({ where: { id } });
  if (!site) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/sites" className="opacity-40 hover:opacity-70 text-sm">
          ← Sites
        </Link>
        <span className="opacity-20">/</span>
        <h1 className="text-xl font-bold">{site.name}</h1>
      </div>
      <SiteForm
        mode="edit"
        initialData={{
          id: site.id,
          domain: site.domain,
          name: site.name,
          tagId: site.tagId,
          tagSlug: site.tagSlug,
          description: site.description ?? "",
          primaryColor: site.primaryColor,
          accentColor: site.accentColor,
          textColor: site.textColor,
          logoUrl: site.logoUrl ?? "",
          metaTitle: site.metaTitle ?? "",
          metaDesc: site.metaDesc ?? "",
          isActive: site.isActive,
        }}
      />
    </div>
  );
}
