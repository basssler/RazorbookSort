import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EditBookForm } from "@/components/edit-book-form";
import { Card } from "@/components/ui/card";
import { getBook } from "@/lib/db";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  return (
    <AppShell currentPath="/inventory">
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Edit book</p>
          <p className="mt-2 text-sm text-muted">Adjust the saved details, then return to the batch inventory.</p>
        </div>
        <EditBookForm book={book} />
        <Link
          href={`/inventory?batchId=${book.batch_id}`}
          className="rounded-3xl border border-line bg-sand px-5 py-4 text-center font-semibold text-ink"
        >
          Back To Inventory
        </Link>
      </Card>
    </AppShell>
  );
}
