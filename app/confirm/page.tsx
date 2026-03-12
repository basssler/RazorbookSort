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
    <AppShell currentPath="/scan" pageTitle="Confirm Book" showBack>
      <ActiveBatchGuard>
        {!params.batchId || !normalizedIsbn ? (
          <div className="p-4">
            <Card className="flex flex-col gap-4">
              <p className="text-xl font-bold text-charcoal">No scan draft found</p>
              <p className="text-sm text-slate-500">Scan or enter an ISBN first, then confirm the minimal details before saving.</p>
              <Link
                href="/scan"
                className="flex h-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-5 text-center text-sm font-semibold text-primary"
              >
                Return To Scanner
              </Link>
            </Card>
          </div>
        ) : (
          <div className="p-4">
            <Card className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Confirm book</p>
                <p className="mt-2 text-sm text-slate-500">Keep this quick. ISBN, bin label, and intake status are enough to save.</p>
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
          </div>
        )}
      </ActiveBatchGuard>
    </AppShell>
  );
}
