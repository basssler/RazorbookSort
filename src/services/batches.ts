import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Batch } from "@/types";

export async function listBatches() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("batches").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Batch[];
}

export async function createBatch(input: {
  name: string;
  sourceLocation?: string;
  status?: string;
}) {
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

export async function getBatchById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("batches").select("*").eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Batch;
}
