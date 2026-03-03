"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteConfig } from "@/lib/sites";

interface Props {
  site: SiteConfig;
  walletAddress?: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export function StoreHeader({
  site,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md"
      style={{ background: `${site.accentColor}e6` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Name */}
        <Link href="/" className="flex items-center gap-2">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.name} className="h-8 w-auto" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: site.primaryColor }}
            >
              ₿
            </div>
          )}
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: site.textColor }}
          >
            {site.name}
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: site.textColor }}
          >
            Browse
          </Link>
          <Link
            href="/#how"
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: site.textColor }}
          >
            How it works
          </Link>
          <Link
            href="/#about"
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: site.textColor }}
          >
            About
          </Link>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-3 py-1.5 rounded-full border border-white/20 font-mono"
                style={{ color: site.textColor }}
              >
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
              <button
                onClick={onDisconnectWallet}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: site.textColor }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: site.primaryColor,
                color: "#000",
              }}
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile menu */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: site.textColor }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3 text-sm"
          style={{ color: site.textColor }}
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/#how" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
