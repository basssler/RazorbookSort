import { fetchBookMetadataByIsbn } from "@/lib/metadata";
import { Batch, Book, DashboardData, LookupResponse } from "@/lib/app-types";
import { normalizeIsbn } from "@/lib/isbn";
import { slugifyBatchName } from "@/lib/utils";
import { createSupabaseAdmin } from "@/lib/supabase";

type CreateBatchInput = {
  name: string;
  location?: string;
  notes?: string;
};

type UpsertBookInput = {
  batchId: string;
  isbn10: string | null;
  isbn13: string | null;
  normalizedIsbn: string;
  title: string;
  authors: string;
  quantity: number;
  notes: string;
};

export async function listBatches() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .order("intake_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Batch[];
}

export async function createBatch(input: CreateBatchInput) {
  const supabase = createSupabaseAdmin();
  const code = slugifyBatchName(input.name).toUpperCase().slice(0, 40) || `BATCH-${Date.now()}`;
  const { data, error } = await supabase
    .from("batches")
    .insert({
      name: input.name.trim(),
      code,
      location: input.location?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Batch;
}

export async function getDashboardData(selectedBatchId?: string | null): Promise<DashboardData> {
  const supabase = createSupabaseAdmin();
  const batches = await listBatches();
  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId) ?? batches[0] ?? null;

  const [{ count: totalBatches }, { count: totalTitles }, { data: quantityRows }, { data: recentBooksData }] =
    await Promise.all([
      supabase.from("batches").select("*", { count: "exact", head: true }),
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("books").select("quantity"),
      supabase
        .from("books")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  return {
    batches,
    selectedBatch,
    totalBatches: totalBatches ?? 0,
    totalTitles: totalTitles ?? 0,
    totalCopies: (quantityRows ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0),
    recentBooks: (recentBooksData ?? []) as Book[],
  };
}

export async function listBooks(options: { batchId?: string | null; search?: string }) {
  const supabase = createSupabaseAdmin();
  let query = supabase.from("books").select("*").order("updated_at", { ascending: false });

  if (options.batchId) {
    query = query.eq("batch_id", options.batchId);
  }

  if (options.search?.trim()) {
    const value = options.search.trim();
    query = query.or(`title.ilike.%${value}%,authors.ilike.%${value}%,isbn_13.ilike.%${value}%,isbn_10.ilike.%${value}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Book[];
}

export async function getBook(id: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Book;
}

export async function lookupIsbnForBatch(batchId: string, rawIsbn: string): Promise<LookupResponse> {
  const normalized = normalizeIsbn(rawIsbn);
  if (!normalized) {
    throw new Error("Scan a valid ISBN-10 or ISBN-13 code.");
  }

  const supabase = createSupabaseAdmin();
  const normalizedIsbn = normalized.isbn13 ?? normalized.isbn10 ?? normalized.raw;

  const { data: duplicate, error } = await supabase
    .from("books")
    .select("*")
    .eq("batch_id", batchId)
    .eq("normalized_isbn", normalizedIsbn)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (duplicate) {
    return {
      mode: "duplicate",
      book: duplicate as Book,
    };
  }

  const metadata =
    (normalized.isbn13 && (await fetchBookMetadataByIsbn(normalized.isbn13))) ||
    (normalized.isbn10 && (await fetchBookMetadataByIsbn(normalized.isbn10)));

  return {
    mode: "new",
    draft: {
      isbn10: normalized.isbn10,
      isbn13: normalized.isbn13,
      normalizedIsbn,
      title: metadata?.title ?? "",
      authors: metadata?.authors ?? "",
      quantity: 1,
      notes: "",
    },
  };
}

export async function incrementBookQuantity(id: string) {
  const book = await getBook(id);
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("books")
    .update({ quantity: book.quantity + 1 })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Book;
}

export async function createBook(input: UpsertBookInput) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("books")
    .insert({
      batch_id: input.batchId,
      isbn_10: input.isbn10,
      isbn_13: input.isbn13,
      normalized_isbn: input.normalizedIsbn,
      title: input.title.trim(),
      authors: input.authors.trim() || null,
      quantity: Math.max(1, input.quantity),
      notes: input.notes.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Book;
}

export async function updateBook(input: Omit<UpsertBookInput, "batchId"> & { id: string }) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("books")
    .update({
      isbn_10: input.isbn10,
      isbn_13: input.isbn13,
      normalized_isbn: input.normalizedIsbn,
      title: input.title.trim(),
      authors: input.authors.trim() || null,
      quantity: Math.max(1, input.quantity),
      notes: input.notes.trim() || null,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Book;
}

export async function exportBatchCsv(batchId: string) {
  const [batch, books] = await Promise.all([
    listBatches().then((items) => items.find((item) => item.id === batchId) ?? null),
    listBooks({ batchId }),
  ]);

  if (!batch) {
    throw new Error("Batch not found.");
  }

  const lines = [
    ["batch_name", "isbn_13", "isbn_10", "title", "authors", "quantity", "notes"].join(","),
    ...books.map((book) =>
      [batch.name, book.isbn_13 ?? "", book.isbn_10 ?? "", book.title, book.authors ?? "", String(book.quantity), book.notes ?? ""]
        .map((value) => `"${String(value).replace(/"/g, "\"\"")}"`)
        .join(","),
    ),
  ];

  return {
    filename: `${batch.code.toLowerCase()}-inventory.csv`,
    content: lines.join("\n"),
  };
}

