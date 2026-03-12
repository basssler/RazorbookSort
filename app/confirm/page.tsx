import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { ConfirmBookForm } from "@/components/confirm-book-form";
import { Card } from "@/components/ui/card";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    batchId?: string;
    isbn?: string;
    isbn10?: string;
    isbn13?: string;
  }>;
}) {
  const params = await searchParams;
  const normalizedIsbn = params.isbn13 ?? params.isbn10 ?? params.isbn ?? "";

  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        {!params.batchId || !normalizedIsbn ? (
          <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
            <p className="text-xl font-black text-stone-900">No scan draft found</p>
            <p className="text-sm text-stone-600">Scan or enter an ISBN first, then confirm the minimal details before saving.</p>
            <Link href="/scan" className="rounded-3xl border border-stone-200 bg-stone-100 px-5 py-4 text-center font-semibold text-stone-900">
              Return To Scanner
            </Link>
          </Card>
        ) : (
          <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Confirm book</p>
              <p className="mt-2 text-sm text-stone-600">Keep this quick. ISBN, bin label, and intake status are enough to save.</p>
            </div>
            <ConfirmBookForm
              draft={{
                batchId: params.batchId,
                isbn10: params.isbn10 ?? null,
                isbn13: params.isbn13 ?? null,
                normalizedIsbn,
                title: "",
                authors: "",
                publisher: "",
                publishedYear: "",
                thumbnailUrl: "",
                quantity: 1,
                notes: "",
              }}
            />
          </Card>
        )}
      </ActiveBatchGuard>
    </AppShell>
  );
}
