import { NextResponse } from "next/server";

import { normalizeScannedIsbn } from "@/services/scanner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = normalizeScannedIsbn(String(body.isbn ?? ""));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process scan." }, { status: 400 });
  }
}
