"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SiteConfig } from "@/lib/sites";
import type { MagisatListing, ListingsResponse } from "@/lib/magisat";
import { ListingCard } from "./ListingCard";
import { FilterBar } from "./FilterBar";
import { BuyModal } from "./BuyModal";
import { StoreHeader } from "./StoreHeader";
import { WalletConnectModal, type WalletInfo } from "./WalletConnect";
import { SatTypeFilter } from "./SatTypeFilter";

interface Props {
  site: SiteConfig;
}

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "PRICE_ASC", label: "Price ↑" },
  { value: "PRICE_DESC", label: "Price ↓" },
  { value: "UPDATED_AT_DESC", label: "Recent" },
  { value: "BLOCK_NUMBER_ASC", label: "Oldest block" },
  { value: "BLOCK_NUMBER_DESC", label: "Newest block" },
];

export function StoreClient({ site }: Props) {
  // Listings state
  const [listings, setListings] = useState<MagisatListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filters
  const [sort, setSort] = useState("PRICE_ASC");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  // null = use site default tagId; string = user-selected tagId
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // Wallet
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Buying
  const [buyListing, setBuyListing] = useState<MagisatListing | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  // UI
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeTagId = selectedTagId ?? site.tagId;

  const fetchListings = useCallback(
    async (newOffset: number, append = false) => {
      setLoading(true);
      try {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagId: activeTagId,
            offset: newOffset,
            limit: PAGE_SIZE,
            orderByColumnWithDirection: [sort],
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          }),
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data: ListingsResponse = await res.json();
        setListings((prev) => append ? [...prev, ...data.results] : data.results);
        setTotal(parseInt(data.count));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [activeTagId, sort, minPrice, maxPrice]
  );

  // Refetch whenever filters change
  useEffect(() => {
    setOffset(0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchListings(0, false), 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchListings]);

  function loadMore() {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    fetchListings(next, true);
  }

  function handleBuy(listing: MagisatListing) {
    if (!wallet) { setShowWalletModal(true); return; }
    setBuyListing(listing);
  }

  const hasMore = listings.length < total && !loading;

  return (
    <div
      className="min-h-screen"
      style={{ background: site.accentColor, color: site.textColor }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:2px; }
        select option { background: #111; }
      `}</style>

      <StoreHeader
        site={site}
        walletAddress={wallet?.address}
        onConnectWallet={() => setShowWalletModal(true)}
        onDisconnectWallet={() => setWallet(null)}
      />

      {/* Hero */}
      <section
        className="py-10 px-4 text-center border-b border-white/10"
        style={{ background: `linear-gradient(180deg, ${site.primaryColor}18 0%, transparent 100%)` }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
          style={{ borderColor: `${site.primaryColor}40`, background: `${site.primaryColor}15`, color: site.primaryColor }}
        >
          ₿ Bitcoin Rarity Marketplace
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{site.name}</h1>
        <p className="opacity-50 max-w-lg mx-auto text-sm">
          {site.description ?? `Buy and sell rare Bitcoin satoshis — non-custodial PSBT transactions.`}
        </p>
        <div className="flex items-center justify-center gap-8 mt-6 text-sm">
          <Stat value={total} label="Listed" color={site.primaryColor} />
        </div>
      </section>

      {/* Mobile filter bar */}
      <div className="lg:hidden px-4 pt-4">
        <SatTypeFilter
          site={site}
          selectedTagId={selectedTagId}
          onSelect={(id) => { setSelectedTagId(id); setOffset(0); }}
          mode="pills"
        />
      </div>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-5">

        {/* Sidebar — desktop only */}
        <div className="hidden lg:block">
          <SatTypeFilter
            site={site}
            selectedTagId={selectedTagId}
            onSelect={(id) => { setSelectedTagId(id); setOffset(0); }}
            mode="sidebar"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Filter bar */}
          <FilterBar
            site={site}
            sort={sort}
            onSortChange={(v) => { setSort(v); setOffset(0); }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={(v) => { setMinPrice(v); setOffset(0); }}
            onMaxPriceChange={(v) => { setMaxPrice(v); setOffset(0); }}
            count={total}
            loading={loading}
            sortOptions={SORT_OPTIONS}
          />

          {/* Active filter badge */}
          {selectedTagId && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs opacity-40">Filtering:</span>
              <button
                onClick={() => setSelectedTagId(null)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors"
                style={{ color: site.textColor }}
              >
                {listings[0]?.mainTag?.label ?? "Custom type"}
                <span className="opacity-40 ml-1">✕</span>
              </button>
            </div>
          )}

          {/* Grid */}
          {listings.length === 0 && !loading ? (
            <div className="text-center py-20 opacity-40">
              <div className="text-5xl mb-4">🔍</div>
              <p>No listings found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} site={site} onBuy={handleBuy} />
              ))}
              {loading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} site={site} />
                ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: site.primaryColor, color: "#000" }}
              >
                Load More ({(total - listings.length).toLocaleString()} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="border-t border-white/10 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "1", t: "Connect Wallet", d: "Connect Unisat, Xverse, or OKX. No account needed — wallet keys never leave your device." },
              { n: "2", t: "Browse & Filter", d: "Filter by sat type — uncommon, rare, epic, palindrome, vintage, and more. All priced in sats." },
              { n: "3", t: "Buy with PSBT", d: "Non-custodial Bitcoin transaction. You sign the PSBT in your wallet. Broadcast automatically." },
            ].map((item) => (
              <div key={item.n} className="rounded-2xl p-5 border border-white/10"
                   style={{ background: `${site.primaryColor}0a` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-3"
                     style={{ background: site.primaryColor, color: "#000" }}>
                  {item.n}
                </div>
                <h3 className="font-semibold mb-1.5 text-sm">{item.t}</h3>
                <p className="text-xs opacity-50 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 px-4 text-center text-xs opacity-20">
        © {new Date().getFullYear()} {site.name} · Powered by Magisat API · Non-custodial PSBT
      </footer>

      {/* Modals */}
      {showWalletModal && (
        <WalletConnectModal
          site={site}
          onConnect={(info) => { setWallet(info); setShowWalletModal(false); }}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {buyListing && wallet && (
        <BuyModal
          listing={buyListing}
          site={site}
          wallet={wallet}
          onClose={() => setBuyListing(null)}
          onSuccess={(id) => { setSuccessTx(id); setBuyListing(null); }}
        />
      )}

      {/* Success toast */}
      {successTx && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl p-4 shadow-2xl border border-green-500/30 bg-black/90 max-w-xs animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">Purchase complete!</p>
              <a href={`https://mempool.space/tx/${successTx}`}
                 target="_blank" rel="noopener noreferrer"
                 className="text-xs text-green-400 underline mt-0.5 block">
                View on mempool.space ↗
              </a>
            </div>
            <button onClick={() => setSuccessTx(null)}
                    className="text-white/30 hover:text-white/80 text-lg transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="font-bold text-lg" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs opacity-35">{label}</div>
    </div>
  );
}

function SkeletonCard({ site }: { site: SiteConfig }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/5 animate-pulse"
      style={{ background: `${site.accentColor}80` }}
    >
      <div className="h-[140px] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-white/8 rounded w-2/3" />
        <div className="h-2 bg-white/5 rounded w-1/2" />
        <div className="h-7 bg-white/8 rounded mt-2" />
      </div>
    </div>
  );
}
