import { NextResponse } from "next/server";

import { createBatch, listBatches } from "@/lib/db";

export async function GET() {
  try {
    const batches = await listBatches();
    return NextResponse.json({ batches });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load batches." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const batch = await createBatch(body);
    return NextResponse.json({ batch });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create batch." }, { status: 400 });
  }
}

