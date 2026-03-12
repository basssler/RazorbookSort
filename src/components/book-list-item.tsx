import Link from "next/link";

import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Book } from "@/lib/app-types";

export function BookListItem({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}/edit`}
      className="flex items-center gap-4 border-b border-primary/5 bg-white px-4 py-4 transition-colors hover:bg-primary/5 active:bg-primary/5"
    >
      {/* Thumbnail */}
      {book.thumbnail_url ? (
        <div
          className="size-16 shrink-0 rounded-lg border border-primary/10 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${book.thumbnail_url})` }}
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
          <Icon name="menu_book" size="text-2xl" />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-base font-bold leading-tight text-charcoal">
          {book.title || "Untitled book"}
        </p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
          {book.authors || "Unknown author"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Chip>{book.quantity} {book.quantity === 1 ? "copy" : "copies"} scanned</Chip>
        </div>
      </div>

      {/* Chevron */}
      <div className="shrink-0">
        <Icon name="chevron_right" className="text-slate-400" />
      </div>
    </Link>
  );
}
