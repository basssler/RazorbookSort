import Link from "next/link";

import { Book } from "@/lib/app-types";
import { formatDate } from "@/lib/utils";

export function BookListItem({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}/edit`} className="block rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-lg font-extrabold text-ink">{book.title || "Untitled book"}</p>
          <p className="mt-1 text-sm text-muted">{book.authors || "Unknown author"}</p>
          <p className="mt-2 text-sm text-muted">{book.isbn_13 || book.isbn_10 || "No ISBN saved"}</p>
        </div>
        <div className="rounded-full bg-sand px-3 py-1 text-sm font-bold text-ink">Qty {book.quantity}</div>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accentDark">
        {(book.intake_status ?? "No status")} | {book.bin_label ?? "No bin"} | {formatDate(book.updated_at)}
      </p>
    </Link>
  );
}
