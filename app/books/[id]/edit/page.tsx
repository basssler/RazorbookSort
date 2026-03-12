import { AppShell } from "@/components/app-shell";
import { EditBookForm } from "@/components/edit-book-form";
import { Card } from "@/components/ui/card";
import { getBook } from "@/lib/db";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  return (
    <AppShell currentPath="/inventory">
      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Edit book</p>
          <p className="mt-2 text-sm text-stone-600">Adjust the record details for this saved book.</p>
        </div>
        <EditBookForm book={book} />
      </Card>
    </AppShell>
  );
}
