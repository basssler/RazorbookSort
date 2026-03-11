import { Batch, Book, LookupResponse } from "@/lib/app-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateBatchInput = {
  name: string;
  sourceLocation?: string;
  status?: string;
};

export async function listBatches() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Batch[];
}

export async function createBatch(input: CreateBatchInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batches")
    .insert({
      name: input.name.trim(),
      source_location: input.sourceLocation?.trim() || null,
      status: input.status?.trim() || "open",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Batch;
}

export async function listBooks(_: { batchId?: string | null; search?: string }) {
  throw new Error("Inventory list is not implemented until milestone 3.");
}

export async function getBook(_: string): Promise<Book> {
  throw new Error("Book detail is not implemented until milestone 3.");
}

export async function lookupIsbnForBatch(_: string, __: string): Promise<LookupResponse> {
  throw new Error("Scanner lookup is not implemented until milestone 4.");
}

export async function incrementBookQuantity(_: string): Promise<Book> {
  throw new Error("Duplicate quantity increment is not implemented until milestone 5.");
}

export async function createBook(_: unknown): Promise<Book> {
  throw new Error("Book creation is not implemented until milestone 6.");
}

export async function updateBook(_: unknown): Promise<Book> {
  throw new Error("Book editing is not implemented until milestone 3.");
}

export async function exportBatchCsv(_: string): Promise<{ filename: string; content: string }> {
  throw new Error("CSV export is not implemented until milestone 8.");
}
