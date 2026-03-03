/**
 * Broadcast a fully signed PSBT to the Bitcoin network.
 *
 * Two modes:
 *  - tryMagisat=true  → first try Magisat's finalize endpoint, fallback to mempool.space
 *  - tryMagisat=false → broadcast directly via mempool.space
 */
import { NextRequest, NextResponse } from "next/server";
import { finalizePurchase } from "@/lib/magisat";
import { broadcastRawTx } from "@/lib/psbt-fee";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      signedPsbtBase64,
      tryMagisat = true,
      magisatPayload, // { listings, buyerAddress, buyerPublicKey, buyerWalletType, optimizationLevel }
    } = body;

    if (!signedPsbtBase64) {
      return NextResponse.json({ error: "signedPsbtBase64 required" }, { status: 400 });
    }

    let txId: string | null = null;
    let broadcastSource = "unknown";

    // Attempt 1: Magisat finalize (platform fee already embedded in PSBT,
    // buyer signed it — if Magisat accepts it they broadcast on-chain)
    if (tryMagisat && magisatPayload) {
      try {
        const result = await finalizePurchase({
          ...magisatPayload,
          buyerSignature: signedPsbtBase64,
        });
        const r = Array.isArray(result) ? result[0] : result as Record<string, unknown>;
        txId = (r?.txId as string) ?? null;
        broadcastSource = "magisat";
      } catch (magisatErr) {
        console.warn(
          "Magisat finalize rejected modified PSBT, falling back to direct broadcast:",
          magisatErr instanceof Error ? magisatErr.message : magisatErr
        );
      }
    }

    // Attempt 2: Direct broadcast via mempool.space
    if (!txId) {
      txId = await broadcastRawTx(signedPsbtBase64);
      broadcastSource = "mempool";
    }

    return NextResponse.json({ txId, broadcastSource });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
