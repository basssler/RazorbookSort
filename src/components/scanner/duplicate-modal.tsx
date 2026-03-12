"use client";

import { Book } from "@/types";

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
    <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-white/90 p-4 shadow-xl backdrop-blur-md">
      <p className="text-sm font-semibold leading-tight text-slate-800">
        Duplicate ISBN detected in this batch.
      </p>
      {book.title && (
        <p className="text-xs text-slate-500">
          {book.title}{book.authors ? ` — ${book.authors}` : ""} (Qty: {book.quantity})
        </p>
      )}
      <div className="flex gap-2">
        <button
          disabled={busy}
          type="button"
          onClick={() => void onAddCopy()}
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Updating..." : "Add Another"}
        </button>
        <button
          disabled={busy}
          type="button"
          onClick={onOpenRecord}
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          Open Record
        </button>
        <button
          disabled={busy}
          type="button"
          onClick={onCancel}
          className="flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-[11px] font-bold uppercase text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
