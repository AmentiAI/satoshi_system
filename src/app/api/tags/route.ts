import { NextResponse } from "next/server";
import { getTags } from "@/lib/magisat";

export async function GET() {
  try {
    const data = await getTags();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Tags error:", err);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
