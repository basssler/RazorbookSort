import { NextResponse } from "next/server";

import { getBook, updateBook } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await getBook(id);
    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load book." }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await params;
    const book = await updateBook({
      id,
      isbn10: body.isbn10 ?? null,
      isbn13: body.isbn13 ?? null,
      title: String(body.title ?? ""),
      authors: String(body.authors ?? ""),
      publisher: String(body.publisher ?? ""),
      publishedYear: body.publishedYear == null ? null : Number(body.publishedYear),
      thumbnailUrl: String(body.thumbnailUrl ?? ""),
      binLabel: String(body.binLabel ?? ""),
      intakeStatus: String(body.intakeStatus ?? ""),
      quantity: Number(body.quantity ?? 1),
      notes: String(body.notes ?? ""),
    });
    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update book." }, { status: 400 });
  }
}
