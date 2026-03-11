import { NextResponse } from "next/server";

import { lookupIsbnForBatch } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await lookupIsbnForBatch(body.batchId, body.isbn);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process scan." }, { status: 400 });
  }
}

