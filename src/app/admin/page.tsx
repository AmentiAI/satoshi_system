import { getAllSites } from "@/lib/db";
import Link from "next/link";

export default async function AdminPage() {
  const sites = await getAllSites();
  const activeSites = sites.filter((s) => s.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-50 mt-1">Manage your rare sat storefronts</p>
        </div>
        <Link
          href="/admin/sites/new"
          className="px-4 py-2 bg-orange-500 text-black rounded-lg text-sm font-semibold hover:bg-orange-400 transition-colors"
        >
          + New Site
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sites" value={sites.length} />
        <StatCard label="Active Sites" value={activeSites.length} />
        <StatCard label="Domains" value={sites.length} />
        <StatCard label="Sat Types" value={new Set(sites.map((s) => s.tagSlug)).size} />
      </div>

      {/* Sites */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Sites</h2>
        {sites.length === 0 ? (
          <div className="text-center py-16 opacity-40 border border-white/10 rounded-2xl">
            <p className="text-4xl mb-3">🌐</p>
            <p>No sites yet. Create your first site to get started.</p>
            <Link
              href="/admin/sites/new"
              className="inline-block mt-4 px-6 py-2 bg-orange-500 text-black rounded-lg text-sm font-semibold"
            >
              Create Site
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-colors"
                style={{ background: `${site.accentColor}44` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: site.primaryColor }}
                      />
                      <span className="font-semibold">{site.name}</span>
                    </div>
                    <p className="text-xs opacity-50 mt-1">{site.domain}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      site.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {site.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="text-xs opacity-40 mb-4 space-y-1">
                  <div>Sat type: <span className="opacity-80 font-mono">{site.tagSlug}</span></div>
                  {site.description && (
                    <div className="truncate">{site.description}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/sites/${site.id}`}
                    className="flex-1 text-center py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </Link>
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors"
                  >
                    Visit ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <div className="text-2xl font-bold text-orange-400">{value}</div>
      <div className="text-sm opacity-40 mt-1">{label}</div>
    </div>
  );
}
