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
    const book = await updateBook({ id, ...body });
    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update book." }, { status: 400 });
  }
}

