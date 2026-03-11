import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BatchSelector } from "@/components/batch-selector";
import { BookListItem } from "@/components/book-list-item";
import { Card } from "@/components/ui/card";
import { FieldShell, TextInput } from "@/components/ui/field";
import { listBatches, listBooks } from "@/lib/db";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; search?: string }>;
}) {
  const params = await searchParams;
  const batches = await listBatches();
  const selectedBatch = batches.find((batch) => batch.id === params.batchId) ?? batches[0] ?? null;
  const books = await listBooks({
    batchId: selectedBatch?.id ?? null,
    search: params.search ?? "",
  });

  return (
    <AppShell currentPath="/inventory">
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Inventory search</p>
            <p className="mt-2 text-sm text-muted">Search by title, author, or ISBN inside the current batch.</p>
          </div>
          <BatchSelector batches={batches} selectedBatchId={selectedBatch?.id ?? null} />
          <form className="flex flex-col gap-3" action="/inventory">
            {selectedBatch ? <input type="hidden" name="batchId" value={selectedBatch.id} /> : null}
            <FieldShell label="Search">
              <TextInput name="search" defaultValue={params.search ?? ""} placeholder="Magic Tree House or 978..." />
            </FieldShell>
            <button
              className="min-h-14 rounded-3xl border border-line bg-sand px-5 text-base font-semibold text-ink"
              type="submit"
            >
              Search Inventory
            </button>
          </form>
          {selectedBatch ? (
            <Link
              href={`/api/batches/${selectedBatch.id}/export`}
              className="rounded-3xl border border-line bg-sand px-5 py-4 text-center font-semibold text-ink"
            >
              Export This Batch To CSV
            </Link>
          ) : null}
        </Card>

        <div className="flex flex-col gap-3">
          {books.length > 0 ? (
            books.map((book) => <BookListItem key={book.id} book={book} />)
          ) : (
            <Card>
              <p className="text-sm font-semibold text-muted">No titles found for this batch and search.</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
