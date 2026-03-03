import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-6">
        <Link href="/admin" className="font-bold text-orange-400 text-lg">
          ₿ Admin
        </Link>
        <Link href="/admin" className="text-sm opacity-70 hover:opacity-100">
          Dashboard
        </Link>
        <Link href="/admin/sites" className="text-sm opacity-70 hover:opacity-100">
          Sites
        </Link>
        <Link href="/admin/sites/new" className="text-sm opacity-70 hover:opacity-100">
          + New Site
        </Link>
        <div className="flex-1" />
        <a
          href="/"
          className="text-sm opacity-40 hover:opacity-70"
          target="_blank"
        >
          View Store ↗
        </a>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
