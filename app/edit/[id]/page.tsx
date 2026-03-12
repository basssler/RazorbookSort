import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EditBookForm } from "@/components/edit-book-form";
import { Icon } from "@/components/ui/icon";
import { getBook } from "@/lib/db";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  return (
    <AppShell
      currentPath="/inventory"
      pageTitle="Edit Book"
      showBack
      headerAction={
        <button
          form="edit-book-form"
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90"
        >
          <Icon name="check" />
        </button>
      }
    >
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Book Details</h3>
        <EditBookForm book={book} />
        <div className="flex justify-center pt-4">
          <Link
            href="/inventory"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-primary"
          >
            Back To Inventory
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
