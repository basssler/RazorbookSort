import { NextResponse } from "next/server";

import { fetchOpenLibraryMetadataByIsbn } from "@/services/metadata";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get("isbn");

    if (!isbn) {
      return NextResponse.json({ error: "ISBN is required." }, { status: 400 });
    }

    const metadata = await fetchOpenLibraryMetadataByIsbn(isbn);
    return NextResponse.json({ metadata });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch metadata." },
      { status: 500 },
    );
  }
}
