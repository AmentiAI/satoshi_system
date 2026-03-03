"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KNOWN_SAT_TAGS } from "@/lib/sat-tags";

interface SiteFormData {
  domain: string;
  name: string;
  tagId: string;
  tagSlug: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  logoUrl: string;
  metaTitle: string;
  metaDesc: string;
  isActive: boolean;
}

interface Props {
  initialData?: Partial<SiteFormData> & { id?: string };
  mode: "create" | "edit";
}

const DEFAULT: SiteFormData = {
  domain: "",
  name: "",
  tagId: "",
  tagSlug: "",
  description: "",
  primaryColor: "#f7931a",
  accentColor: "#0d0d0d",
  textColor: "#ffffff",
  logoUrl: "",
  metaTitle: "",
  metaDesc: "",
  isActive: true,
};

export function SiteForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [data, setData] = useState<SiteFormData>({ ...DEFAULT, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function set(key: keyof SiteFormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleTagSelect(slug: string) {
    const tag = KNOWN_SAT_TAGS.find((t) => t.slug === slug);
    if (tag) {
      set("tagId", tag.id);
      set("tagSlug", tag.slug);
      set("primaryColor", tag.color);
      if (!data.name) set("name", `Buy ${tag.label} Sats`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url =
        mode === "create"
          ? "/api/sites"
          : `/api/sites/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      router.push("/admin/sites");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${data.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/sites/${initialData?.id}`, { method: "DELETE" });
      router.push("/admin/sites");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400/50 transition-colors";
  const labelClass = "block text-sm font-medium opacity-70 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="font-semibold mb-5">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Domain *</label>
            <input
              type="text"
              value={data.domain}
              onChange={(e) => set("domain", e.target.value)}
              placeholder="buyuncommonsats.com"
              className={inputClass}
              required
            />
            <p className="text-xs opacity-30 mt-1">Without https:// or trailing slash</p>
          </div>
          <div>
            <label className={labelClass}>Site Name *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Buy Uncommon Sats"
              className={inputClass}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what this store sells..."
              className={`${inputClass} resize-none h-20`}
            />
          </div>
        </div>
      </section>

      {/* Sat Type */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="font-semibold mb-5">Sat Type (Magisat Tag)</h2>

        <div className="mb-4">
          <label className={labelClass}>Quick Select</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {KNOWN_SAT_TAGS.map((tag) => (
              <button
                key={tag.slug}
                type="button"
                onClick={() => handleTagSelect(tag.slug)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  data.tagSlug === tag.slug
                    ? "border-orange-400 bg-orange-400/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ background: tag.color }}
                />
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tag ID (UUID) *</label>
            <input
              type="text"
              value={data.tagId}
              onChange={(e) => set("tagId", e.target.value)}
              placeholder="86b46002-9216-4d19-9f3f-46c61c34632f"
              className={`${inputClass} font-mono text-xs`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Tag Slug *</label>
            <input
              type="text"
              value={data.tagSlug}
              onChange={(e) => set("tagSlug", e.target.value)}
              placeholder="uncommon"
              className={inputClass}
              required
            />
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="font-semibold mb-5">Theme & Branding</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className={`${inputClass} flex-1 font-mono`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={data.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className={`${inputClass} flex-1 font-mono`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={data.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className={`${inputClass} flex-1 font-mono`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Logo URL (optional)</label>
          <input
            type="url"
            value={data.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* Preview */}
        <div
          className="mt-4 rounded-xl p-4 border border-white/10 flex items-center gap-3"
          style={{ background: data.accentColor }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: data.primaryColor, color: "#000" }}
          >
            ₿
          </div>
          <span style={{ color: data.textColor }} className="font-semibold">
            {data.name || "Site Name"}
          </span>
          <div className="flex-1" />
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: data.primaryColor, color: "#000" }}
          >
            Connect Wallet
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="font-semibold mb-5">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input
              type="text"
              value={data.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder={data.name}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              value={data.metaDesc}
              onChange={(e) => set("metaDesc", e.target.value)}
              placeholder={data.description}
              className={`${inputClass} resize-none h-16`}
            />
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-white/10 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Site Active</p>
          <p className="text-xs opacity-40">Inactive sites show a maintenance page</p>
        </div>
        <button
          type="button"
          onClick={() => set("isActive", !data.isActive)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            data.isActive ? "bg-green-500" : "bg-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
              data.isActive ? "left-6.5" : "left-0.5"
            }`}
            style={{ left: data.isActive ? "26px" : "2px" }}
          />
        </button>
      </section>

      {error && (
        <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-orange-500 text-black rounded-lg font-semibold text-sm hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Site" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-4 py-2.5 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete Site"}
          </button>
        )}
      </div>
    </form>
  );
}
