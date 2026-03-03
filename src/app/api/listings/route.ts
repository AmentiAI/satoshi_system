import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/magisat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await getListings({
      tagId: body.tagId,
      offset: body.offset ?? 0,
      limit: body.limit ?? 24,
      orderByColumnWithDirection: body.orderByColumnWithDirection ?? ["PRICE_ASC"],
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Listings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
