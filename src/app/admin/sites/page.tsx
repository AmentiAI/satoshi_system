import { getAllSites } from "@/lib/db";
import Link from "next/link";

export default async function SitesPage() {
  const sites = await getAllSites();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Sites</h1>
        <Link
          href="/admin/sites/new"
          className="px-4 py-2 bg-orange-500 text-black rounded-lg text-sm font-semibold hover:bg-orange-400 transition-colors"
        >
          + New Site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <p className="text-4xl mb-3">🌐</p>
          <p>No sites yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 px-5 py-4 hover:border-white/20 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: site.primaryColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{site.name}</p>
                <p className="text-xs opacity-40 truncate">{site.domain}</p>
              </div>
              <div className="text-xs font-mono opacity-40">{site.tagSlug}</div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  site.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {site.isActive ? "Active" : "Off"}
              </span>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/admin/sites/${site.id}`}
                  className="px-3 py-1 border border-white/10 rounded-lg text-xs hover:bg-white/5 transition-colors"
                >
                  Edit
                </Link>
                <a
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 border border-white/10 rounded-lg text-xs hover:bg-white/5 transition-colors"
                >
                  Visit ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
