import { NextRequest, NextResponse } from "next/server";
import { getPreparedPsbt } from "@/lib/magisat";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buyerAddress = searchParams.get("buyerAddress") ?? "";
  const buyerPublicKey = searchParams.get("buyerPublicKey") ?? "";
  const feeRateTier =
    (searchParams.get("feeRateTier") as "fastestFee") ?? "fastestFee";
  const listingIds = (searchParams.get("listingIds") ?? "").split(",").filter(Boolean);

  if (!buyerAddress || !buyerPublicKey || !listingIds.length) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    const data = await getPreparedPsbt({ buyerAddress, buyerPublicKey, feeRateTier, listingIds });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
