import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { ConfirmBookForm } from "@/components/confirm-book-form";
import { Icon } from "@/components/ui/icon";

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
    <AppShell currentPath="/scan" pageTitle="Confirm Book" showBack hideHeaderActions>
      <ActiveBatchGuard>
        {!params.batchId || !normalizedIsbn ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon name="menu_book" size="text-3xl" className="text-primary" />
            </div>
            <p className="text-xl font-bold text-charcoal">No scan draft found</p>
            <p className="text-sm text-slate-500">
              Scan or enter an ISBN first, then confirm the minimal details before saving.
            </p>
            <Link
              href="/scan"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
            >
              <Icon name="barcode_scanner" size="text-lg" />
              Return To Scanner
            </Link>
          </div>
        ) : (
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
        )}
      </ActiveBatchGuard>
    </AppShell>
  );
}
