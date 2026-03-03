"use client";

import { useState, useEffect } from "react";
import type { MagisatListing } from "@/lib/magisat";
import { formatSatsDisplay } from "@/lib/utils";
import type { SiteConfig } from "@/lib/sites";
import type { WalletInfo } from "./WalletConnect";
import { SatVisual } from "./SatVisual";

interface Props {
  listing: MagisatListing;
  site: SiteConfig;
  wallet: WalletInfo;
  onClose: () => void;
  onSuccess: (txId: string) => void;
}

type Step = "confirm" | "preparing" | "signing" | "broadcasting" | "done" | "error";

type UnisatWindow = {
  unisat?: {
    signPsbt: (psbt: string, opts: { autoFinalized: boolean }) => Promise<string>;
  };
};

type XverseSignResp = { status: string; result: { psbt: string } };

export function BuyModal({ listing, site, wallet, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [error, setError] = useState("");
  const [txId, setTxId] = useState("");
  const [platformFeeSats, setPlatformFeeSats] = useState<number>(0);

  // 15% of listing price, shown before API confirms
  const listingPrice = parseInt(listing.price);
  const feeSatsEstimate = Math.max(1000, Math.ceil(listingPrice * 0.15));

  async function handleBuy() {
    try {
      setStep("preparing");

      // ── Step 1: Prepare (dummy UTXOs check) ───────────────────────────────
      const prepRes = await fetch(
        `/api/buy/prepare?` +
          new URLSearchParams({
            buyerAddress: wallet.address,
            buyerPublicKey: wallet.publicKey,
            feeRateTier: "fastestFee",
            listingIds: listing.id,
          })
      );
      const prepData = await prepRes.json();
      if (!prepRes.ok) throw new Error(prepData.error || "Prepare failed");

      // If dummy UTXOs needed, sign the prepared PSBT first
      if (prepData.psbtToBase64 && !prepData.hasEnoughDummyUtxos) {
        setStep("signing");
        const signedPrepared = await signPsbt(
          prepData.psbtToBase64,
          wallet.walletType,
          { autoFinalized: false }
        );
        const bcastRes = await fetch("/api/buy/broadcast-prepared", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ psbtBase64: signedPrepared }),
        });
        if (!bcastRes.ok) throw new Error("Failed to broadcast prepared tx");
      }

      // ── Step 2: Get buying PSBT (platform fee injected server-side) ───────
      setStep("preparing");
      const buyRes = await fetch("/api/buy/buying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listings: [{ listingId: listing.id, receiveAddress: wallet.ordinalsAddress }],
          buyerAddress: wallet.address,
          buyerPublicKey: wallet.publicKey,
          feeRateTier: "fastestFee",
          optimizationLevel: 0,
          // Used server-side to calculate 15% platform fee
          totalPriceSats: parseInt(listing.price),
        }),
      });
      const buyData = await buyRes.json();
      if (!buyRes.ok) throw new Error(buyData.error || "Failed to create buying PSBT");

      if (buyData.platformFeeSats) {
        setPlatformFeeSats(buyData.platformFeeSats);
      }

      // ── Step 3: Buyer signs the PSBT (includes our fee output) ───────────
      setStep("signing");
      const signedBuyPsbt = await signPsbt(
        buyData.psbtToBase64,
        wallet.walletType,
        { autoFinalized: true }
      );

      // ── Step 4: Broadcast (try Magisat first, fall back to mempool.space) ─
      setStep("broadcasting");
      const broadcastRes = await fetch("/api/buy/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedPsbtBase64: signedBuyPsbt,
          tryMagisat: true,
          magisatPayload: {
            listings: [{ listingId: listing.id, receiveAddress: wallet.ordinalsAddress }],
            buyerAddress: wallet.address,
            buyerPublicKey: wallet.publicKey,
            buyerWalletType: wallet.walletType,
            optimizationLevel: 0,
          },
        }),
      });
      const broadcastData = await broadcastRes.json();
      if (!broadcastRes.ok) throw new Error(broadcastData.error || "Broadcast failed");

      setTxId(broadcastData.txId ?? "");
      setStep("done");
      onSuccess(broadcastData.txId ?? "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStep("error");
    }
  }

  const sats = listing.mainSatoshi;
  const total = listingPrice + (listing.minFeeTotal ?? 0);

  const stepLabel: Record<Step, string> = {
    confirm: "",
    preparing: "Preparing transaction…",
    signing: "Waiting for wallet signature…",
    broadcasting: "Broadcasting to Bitcoin network…",
    done: "Complete!",
    error: "",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: site.accentColor, color: site.textColor }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-white/10 flex items-center gap-3"
          style={{ background: `${site.primaryColor}12` }}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
               style={{ background: `${site.primaryColor}20` }}>
            <SatVisual listing={listing} size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{listing.mainTag?.label ?? "Rare Sat"}</p>
            {sats?.name && (
              <p className="text-xs opacity-40 font-mono truncate">{sats.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="opacity-40 hover:opacity-80 text-xl transition-opacity shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Price breakdown */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="opacity-50">Listing price</span>
              <span className="font-medium">{formatSatsDisplay(listing.price)}</span>
            </div>
            {listing.minFeeTotal ? (
              <div className="flex justify-between text-sm">
                <span className="opacity-50">Network fee (est.)</span>
                <span className="font-medium">~{listing.minFeeTotal.toLocaleString()} sats</span>
              </div>
            ) : null}
            <div
              className="flex justify-between font-bold text-base pt-2 border-t border-white/10"
            >
              <span>Total</span>
              <span style={{ color: site.primaryColor }}>
                {formatSatsDisplay(total)}
              </span>
            </div>
          </div>

          {/* Wallet info */}
          <div
            className="rounded-xl p-3 mb-5 text-xs border border-white/10"
            style={{ background: `${site.primaryColor}08` }}
          >
            <div className="flex justify-between mb-1 opacity-50">
              <span>Paying from</span>
              <span className="font-mono">
                {wallet.address.slice(0, 10)}…{wallet.address.slice(-6)}
              </span>
            </div>
            <div className="flex justify-between opacity-50">
              <span>Receiving at</span>
              <span className="font-mono">
                {wallet.ordinalsAddress.slice(0, 10)}…{wallet.ordinalsAddress.slice(-6)}
              </span>
            </div>
          </div>

          {/* Step progress */}
          {step !== "confirm" && step !== "error" && step !== "done" && (
            <div
              className="flex items-center gap-2 justify-center mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ background: `${site.primaryColor}15` }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                style={{ borderColor: site.primaryColor }}
              />
              <span className="opacity-70">{stepLabel[step]}</span>
            </div>
          )}

          {step === "done" && (
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold">Purchase successful!</p>
              {txId && (
                <a
                  href={`https://mempool.space/tx/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs opacity-50 hover:opacity-80 underline mt-1 block"
                >
                  View on mempool.space ↗
                </a>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20"
                 style={{ background: "rgba(239,68,68,0.08)" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          {step === "confirm" && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: site.primaryColor, color: "#000" }}
              >
                Confirm &amp; Buy
              </button>
            </div>
          )}

          {step === "done" && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: site.primaryColor, color: "#000" }}
            >
              Done
            </button>
          )}

          {step === "error" && (
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-sm">
                Close
              </button>
              <button
                onClick={() => { setStep("confirm"); setError(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: site.primaryColor, color: "#000" }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wallet signing helpers ────────────────────────────────────────────────────

async function signPsbt(
  psbtBase64: string,
  walletType: "unisat_wallet" | "xverse_wallet",
  opts: { autoFinalized: boolean }
): Promise<string> {
  if (walletType === "unisat_wallet") {
    const unisat = (window as UnisatWindow).unisat;
    if (!unisat) throw new Error("Unisat wallet not found");
    return unisat.signPsbt(psbtBase64, { autoFinalized: opts.autoFinalized });
  }

  if (walletType === "xverse_wallet") {
    const { request } = await import("sats-connect");
    const resp = await request("signPsbt", {
      psbt: psbtBase64,
      broadcast: false,
    }) as XverseSignResp;
    if (resp.status !== "success") throw new Error("Xverse signing rejected");
    return resp.result.psbt;
  }

  throw new Error("Unsupported wallet type for signing");
}
