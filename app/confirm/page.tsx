import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { ConfirmBookForm } from "@/components/confirm-book-form";
import { Card } from "@/components/ui/card";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    batchId?: string;
    isbn10?: string;
    isbn13?: string;
    normalizedIsbn?: string;
    title?: string;
    authors?: string;
    quantity?: string;
  }>;
}) {
  const params = await searchParams;

  if (!params.batchId || !params.normalizedIsbn) {
    return (
      <AppShell currentPath="/scanner">
        <Card className="flex flex-col gap-4">
          <p className="text-xl font-black text-ink">No scan draft found</p>
          <p className="text-sm text-muted">Scan an ISBN first, then confirm the minimal details before saving.</p>
          <Link href="/scanner" className="rounded-3xl border border-line bg-sand px-5 py-4 text-center font-semibold text-ink">
            Return To Scanner
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/scanner">
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Confirm book</p>
          <p className="mt-2 text-sm text-muted">Keep this quick. Volunteers only need the essentials before saving.</p>
        </div>
        <ConfirmBookForm
          draft={{
            batchId: params.batchId,
            isbn10: params.isbn10 ?? null,
            isbn13: params.isbn13 ?? null,
            normalizedIsbn: params.normalizedIsbn,
            title: params.title ?? "",
            authors: params.authors ?? "",
            quantity: Number(params.quantity ?? 1),
            notes: "",
          }}
        />
      </Card>
    </AppShell>
  );
}

