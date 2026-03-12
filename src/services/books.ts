import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Book } from "@/types";

type ListBooksOptions = {
  batchId: string;
  search?: string;
  binLabel?: string;
  intakeStatus?: string;
};

type UpdateBookInput = {
  id: string;
  isbn10: string | null;
  isbn13: string | null;
  title: string;
  authors: string;
  publisher: string;
  publishedYear: number | null;
  thumbnailUrl: string;
  binLabel: string;
  intakeStatus: string;
  quantity: number;
  notes: string;
};

type CreateBookInput = {
  batchId: string;
  isbn10: string | null;
  isbn13: string | null;
  title: string;
  authors: string;
  publisher: string;
  publishedYear: number | null;
  thumbnailUrl: string;
  binLabel: string;
  intakeStatus: string;
  quantity: number;
  notes: string;
};

export async function listBooksByBatch(options: ListBooksOptions) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("books").select("*").eq("batch_id", options.batchId).order("updated_at", { ascending: false });

  if (options.search?.trim()) {
    const value = options.search.trim();
    query = query.or(`title.ilike.%${value}%,authors.ilike.%${value}%,isbn_13.ilike.%${value}%,isbn_10.ilike.%${value}%`);
  }

  if (options.binLabel?.trim()) {
    query = query.eq("bin_label", options.binLabel.trim());
  }

  if (options.intakeStatus?.trim()) {
    query = query.eq("intake_status", options.intakeStatus.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Book[];
}

export async function getBookById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Book;
}

export async function findDuplicateBookForBatch(options: { batchId: string; isbn10?: string | null; isbn13?: string | null }) {
  const supabase = createSupabaseServerClient();

  if (options.isbn13) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("batch_id", options.batchId)
      .eq("isbn_13", options.isbn13)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data as Book;
    }
  }

  if (options.isbn10) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("batch_id", options.batchId)
      .eq("isbn_10", options.isbn10)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data as Book;
    }
  }

  return null;
}

export async function incrementBookQuantityById(id: string) {
  const book = await getBookById(id);
  const supabase = createSupabaseServerClient();
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

export async function createBookRecord(input: CreateBookInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .insert({
      batch_id: input.batchId,
      isbn_10: input.isbn10,
      isbn_13: input.isbn13,
      title: input.title.trim() || null,
      authors: input.authors.trim() || null,
      publisher: input.publisher.trim() || null,
      published_year: input.publishedYear,
      thumbnail_url: input.thumbnailUrl.trim() || null,
      bin_label: input.binLabel.trim() || null,
      intake_status: input.intakeStatus.trim() || null,
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

export async function updateBookById(input: UpdateBookInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .update({
      isbn_10: input.isbn10,
      isbn_13: input.isbn13,
      title: input.title.trim() || null,
      authors: input.authors.trim() || null,
      publisher: input.publisher.trim() || null,
      published_year: input.publishedYear,
      thumbnail_url: input.thumbnailUrl.trim() || null,
      bin_label: input.binLabel.trim() || null,
      intake_status: input.intakeStatus.trim() || null,
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
