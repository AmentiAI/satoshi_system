"use client";

/**
 * LaserEyes-powered wallet connection modal.
 * Supports: Unisat, Xverse, OKX, Magic Eden, Leather, Orange
 */
import { useState, useEffect } from "react";
import type { SiteConfig } from "@/lib/sites";

// LaserEyes wallet IDs
const WALLETS = [
  { id: "unisat", name: "Unisat", icon: "🟠", desc: "Bitcoin Ordinals wallet" },
  { id: "xverse", name: "Xverse", icon: "🟣", desc: "Bitcoin & Ordinals" },
  { id: "okx", name: "OKX Wallet", icon: "⚫", desc: "Multi-chain wallet" },
  { id: "leather", name: "Leather", icon: "🟤", desc: "Bitcoin web3 wallet" },
  { id: "magic_eden", name: "Magic Eden", icon: "💎", desc: "NFT & Ordinals wallet" },
] as const;

export interface WalletInfo {
  address: string;         // payment address (for fee calculation)
  ordinalsAddress: string; // ordinals/taproot address
  publicKey: string;
  walletType: "unisat_wallet" | "xverse_wallet";
}

interface Props {
  site: SiteConfig;
  onConnect: (info: WalletInfo) => void;
  onClose: () => void;
}

export function WalletConnectModal({ site, onConnect, onClose }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function connectWallet(walletId: string) {
    setConnecting(walletId);
    setError("");

    try {
      if (walletId === "unisat") {
        await connectUnisat(onConnect);
      } else if (walletId === "xverse") {
        await connectXverse(onConnect, site.name);
      } else if (walletId === "okx") {
        await connectOKX(onConnect);
      } else {
        throw new Error(`${walletId} wallet integration coming soon`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: site.accentColor, color: site.textColor }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-white/10 flex items-center justify-between"
          style={{ background: `${site.primaryColor}15` }}
        >
          <div>
            <h2 className="font-bold text-base">Connect Wallet</h2>
            <p className="text-xs opacity-40 mt-0.5">Choose your Bitcoin wallet</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors opacity-50 hover:opacity-100 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Wallets */}
        <div className="p-3 space-y-2">
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => connectWallet(w.id)}
              disabled={!!connecting}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all text-left disabled:opacity-50 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{w.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{w.name}</p>
                <p className="text-xs opacity-40">{w.desc}</p>
              </div>
              {connecting === w.id ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                  style={{ borderColor: site.primaryColor }}
                />
              ) : (
                <svg className="w-4 h-4 opacity-20 group-hover:opacity-60 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-3 mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        <p className="text-[10px] opacity-20 text-center pb-4">
          Non-custodial · Your keys never leave your device
        </p>
      </div>
    </div>
  );
}

// ─── Wallet connectors ────────────────────────────────────────────────────────

type UnisatWindow = {
  unisat?: {
    requestAccounts: () => Promise<string[]>;
    getPublicKey: () => Promise<string>;
    getAccounts: () => Promise<string[]>;
  };
};

async function connectUnisat(onConnect: (info: WalletInfo) => void) {
  const unisat = (window as UnisatWindow).unisat;
  if (!unisat) throw new Error("Unisat not installed. Install from unisat.io");
  const accounts = await unisat.requestAccounts();
  const publicKey = await unisat.getPublicKey();
  onConnect({
    address: accounts[0],
    ordinalsAddress: accounts[0],
    publicKey,
    walletType: "unisat_wallet",
  });
}

async function connectXverse(onConnect: (info: WalletInfo) => void, siteName: string) {
  const { request, AddressPurpose } = await import("sats-connect");
  const resp = await request("getAccounts", {
    purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
    message: `Connect to ${siteName}`,
  });
  if (resp.status !== "success") throw new Error("Wallet connection rejected");
  type Acc = { purpose: string; address: string; publicKey: string };
  const ordinals = (resp.result as Acc[]).find((a) => a.purpose === AddressPurpose.Ordinals);
  const payment = (resp.result as Acc[]).find((a) => a.purpose === AddressPurpose.Payment);
  if (!ordinals) throw new Error("No ordinals account found");
  onConnect({
    address: payment?.address ?? ordinals.address,
    ordinalsAddress: ordinals.address,
    publicKey: ordinals.publicKey,
    walletType: "xverse_wallet",
  });
}

type OKXWindow = {
  okxwallet?: {
    bitcoin?: {
      connect: () => Promise<{ address: string; publicKey: string }>;
    };
  };
};

async function connectOKX(onConnect: (info: WalletInfo) => void) {
  const okx = (window as OKXWindow).okxwallet?.bitcoin;
  if (!okx) throw new Error("OKX Wallet not installed");
  const { address, publicKey } = await okx.connect();
  onConnect({
    address,
    ordinalsAddress: address,
    publicKey,
    walletType: "unisat_wallet", // OKX uses same API shape as Unisat
  });
}
