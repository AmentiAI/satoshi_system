import { NextRequest, NextResponse } from "next/server";
import { broadcastPrepared } from "@/lib/magisat";

export async function POST(req: NextRequest) {
  try {
    const { psbtBase64 } = await req.json();
    const data = await broadcastPrepared(psbtBase64);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
