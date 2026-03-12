"use client";

import { Book } from "@/types";

import { Button } from "@/components/ui/button";

export function DuplicateModal({
  book,
  busy,
  onAddCopy,
  onOpenRecord,
  onCancel,
}: {
  book: Book;
  busy?: boolean;
  onAddCopy: () => Promise<void> | void;
  onOpenRecord: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Duplicate detected</p>
      <p className="mt-3 text-xl font-black text-stone-900">{book.title || "Untitled book"}</p>
      <p className="mt-2 text-sm text-stone-600">{book.authors || "Unknown author"}</p>
      <p className="mt-1 text-sm text-stone-600">Current quantity: {book.quantity}</p>
      <div className="mt-4 flex flex-col gap-3">
        <Button disabled={busy} type="button" onClick={() => void onAddCopy()}>
          {busy ? "Updating..." : "Add Another Copy"}
        </Button>
        <Button disabled={busy} type="button" variant="secondary" onClick={onOpenRecord}>
          Open Existing Record
        </Button>
        <Button disabled={busy} type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
