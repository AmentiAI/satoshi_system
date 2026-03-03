import { NextRequest, NextResponse } from "next/server";
import { finalizePurchase } from "@/lib/magisat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await finalizePurchase(body);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
