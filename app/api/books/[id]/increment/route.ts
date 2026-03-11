import { NextResponse } from "next/server";

import { incrementBookQuantity } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await incrementBookQuantity(id);
    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to increment quantity." }, { status: 400 });
  }
}

