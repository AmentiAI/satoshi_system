import { SiteForm } from "@/components/admin/SiteForm";
import Link from "next/link";

export default function NewSitePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/sites" className="opacity-40 hover:opacity-70 text-sm">
          ← Sites
        </Link>
        <span className="opacity-20">/</span>
        <h1 className="text-xl font-bold">New Site</h1>
      </div>
      <SiteForm mode="create" />
    </div>
  );
}
