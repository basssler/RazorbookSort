import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BatchSelector } from "@/components/batch-selector";
import { BookListItem } from "@/components/book-list-item";
import { CreateBatchForm } from "@/components/create-batch-form";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/db";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const params = await searchParams;
  const dashboard = await getDashboardData(params.batchId);

  return (
    <AppShell currentPath="/">
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Active batch</p>
            <p className="mt-2 text-sm text-muted">Pick the intake batch before volunteers start scanning.</p>
          </div>
          <BatchSelector batches={dashboard.batches} selectedBatchId={dashboard.selectedBatch?.id ?? null} />
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={dashboard.selectedBatch ? `/scanner?batchId=${dashboard.selectedBatch.id}` : "/scanner"}
              className="flex min-h-14 items-center justify-center rounded-3xl border border-accentDark bg-accent px-5 text-base font-semibold text-ink shadow-card"
            >
              Open Scanner
            </Link>
            <Link
              href={dashboard.selectedBatch ? `/inventory?batchId=${dashboard.selectedBatch.id}` : "/inventory"}
              className="flex min-h-14 items-center justify-center rounded-3xl border border-line bg-sand px-5 text-base font-semibold text-ink"
            >
              Open Inventory
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-sm font-semibold text-muted">Batches</p>
            <p className="mt-2 text-3xl font-black text-ink">{dashboard.totalBatches}</p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-muted">Titles / Copies</p>
            <p className="mt-2 text-3xl font-black text-ink">
              {dashboard.totalTitles} / {dashboard.totalCopies}
            </p>
          </Card>
        </div>

        <Card className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Create batch</p>
            <p className="mt-2 text-sm text-muted">Keep it simple: one batch per pickup, drive, or sorting session.</p>
          </div>
          <CreateBatchForm />
        </Card>

        <Card className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Recent intake</p>
            <p className="mt-2 text-sm text-muted">Tap any title to edit the saved record.</p>
          </div>
          <div className="flex flex-col gap-3">
            {dashboard.recentBooks.length > 0 ? (
              dashboard.recentBooks.map((book) => <BookListItem key={book.id} book={book} />)
            ) : (
              <p className="rounded-3xl bg-sand px-4 py-5 text-sm font-semibold text-muted">
                No books saved yet. Open the scanner once a batch is selected.
              </p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
