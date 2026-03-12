import { NextResponse } from "next/server";

import { findDuplicateBook } from "@/lib/db";
import { normalizeScannedIsbn } from "@/services/scanner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = normalizeScannedIsbn(String(body.isbn ?? ""));

    if (body.batchId) {
      const duplicate = await findDuplicateBook({
        batchId: String(body.batchId),
        isbn10: result.isbn10,
        isbn13: result.isbn13,
      });

      if (duplicate) {
        return NextResponse.json({
          mode: "duplicate",
          book: duplicate,
        });
      }
    }

    return NextResponse.json({
      mode: "new",
      ...result,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process scan." }, { status: 400 });
  }
}
