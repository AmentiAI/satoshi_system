import { NextRequest, NextResponse } from "next/server";
import { getBuyingPsbt } from "@/lib/magisat";
import { injectPlatformFee } from "@/lib/psbt-fee";

const PLATFORM_FEE_RATE = 0.15; // 15%
const MIN_FEE_SATS = 1000;       // floor so tiny listings always pay something

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Step 1: Get buying PSBT from Magisat (has seller signatures)
    const magisatData = await getBuyingPsbt(body) as {
      psbtToBase64: string;
      psbtToHex: string;
      structure: string;
      increasedFeeRate: number;
      feeRate: number;
      saleableListings: unknown[];
    };

    if (!magisatData.psbtToBase64) {
      return NextResponse.json(magisatData);
    }

    // Step 2: Calculate 15% platform fee from total listing price
    const totalListingPrice: number = (() => {
      const listings = body.listings as Array<{ listingId: string }>;
      // listingPrice is passed from client alongside listing IDs
      const priceSats = body.totalPriceSats as number | undefined;
      return priceSats ?? 0;
    })();

    let platformFeeSats = Math.max(
      MIN_FEE_SATS,
      Math.ceil(totalListingPrice * PLATFORM_FEE_RATE)
    );

    // Step 3: Inject fee into PSBT
    let modifiedPsbt = magisatData.psbtToBase64;

    try {
      modifiedPsbt = injectPlatformFee(
        magisatData.psbtToBase64,
        body.buyerAddress,
        platformFeeSats
      );
    } catch (feeErr) {
      // Fee injection failed — log and continue with original PSBT
      // so the purchase still goes through
      console.error("Platform fee injection failed:", feeErr);
      modifiedPsbt = magisatData.psbtToBase64;
      platformFeeSats = 0;
    }

    return NextResponse.json({
      ...magisatData,
      psbtToBase64: modifiedPsbt,
      psbtToHex: Buffer.from(modifiedPsbt, "base64").toString("hex"),
      platformFeeSats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
