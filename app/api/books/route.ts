import { NextResponse } from "next/server";

import { createBook, listBooks } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const books = await listBooks({
      batchId: searchParams.get("batchId"),
      search: searchParams.get("search") ?? "",
    });
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load books." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const book = await createBook(body);
    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save book." }, { status: 400 });
  }
}

