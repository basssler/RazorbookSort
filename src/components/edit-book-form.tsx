"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Book } from "@/lib/app-types";
import { BIN_LABELS, INTAKE_STATUSES } from "@/types";

export function EditBookForm({ book }: { book: Book }) {
  const router = useRouter();
  const [title, setTitle] = useState(book.title ?? "");
  const [authors, setAuthors] = useState(book.authors ?? "");
  const [publisher, setPublisher] = useState(book.publisher ?? "");
  const [publishedYear, setPublishedYear] = useState(book.published_year ? String(book.published_year) : "");
  const [thumbnailUrl, setThumbnailUrl] = useState(book.thumbnail_url ?? "");
  const [binLabel, setBinLabel] = useState(book.bin_label ?? "");
  const [intakeStatus, setIntakeStatus] = useState(book.intake_status ?? "");
  const [quantity, setQuantity] = useState(String(book.quantity));
  const [notes, setNotes] = useState(book.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClasses =
    "block w-full rounded-lg bg-white border-slate-200 text-charcoal focus:border-primary focus:ring-primary h-12 px-4";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isbn10: book.isbn_10,
        isbn13: book.isbn_13,
        title,
        authors,
        publisher,
        publishedYear: publishedYear ? Number(publishedYear) : null,
        thumbnailUrl,
        binLabel,
        intakeStatus,
        quantity: Number(quantity) || 1,
        notes,
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update book.");
      return;
    }

    router.push("/inventory");
    router.refresh();
  }

  return (
    <form id="edit-book-form" onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      {/* Title */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-charcoal">Title</span>
        <input
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
        />
      </label>

      {/* Author */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-charcoal">Author</span>
        <input
          name="authors"
          type="text"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          className={inputClasses}
        />
      </label>

      {/* ISBN (read-only) */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-charcoal">ISBN</span>
        <input
          type="text"
          value={book.isbn_13 ?? book.isbn_10 ?? ""}
          readOnly
          className={`${inputClasses} bg-slate-50 text-slate-500`}
        />
      </label>

      {/* Publisher */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-charcoal">Publisher</span>
        <input
          name="publisher"
          type="text"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          className={inputClasses}
        />
      </label>

      {/* Year + Quantity side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-charcoal">Year</span>
          <input
            name="publishedYear"
            type="number"
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value)}
            placeholder="2024"
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-charcoal">Quantity</span>
          <input
            name="quantity"
            type="number"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClasses}
          />
        </label>
      </div>

      {/* Bin + Status side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-charcoal">Bin Label</span>
          <select
            name="binLabel"
            value={binLabel}
            onChange={(e) => setBinLabel(e.target.value)}
            className={inputClasses}
          >
            <option value="">Select bin</option>
            {BIN_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-charcoal">Status</span>
          <select
            name="intakeStatus"
            value={intakeStatus}
            onChange={(e) => setIntakeStatus(e.target.value)}
            className={inputClasses}
          >
            <option value="">Select status</option>
            {INTAKE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Notes */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-charcoal">Notes</span>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          rows={3}
          className="block w-full rounded-lg border-slate-200 bg-white px-4 py-2 text-charcoal focus:border-primary focus:ring-primary"
        />
      </label>

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      {/* Save Changes CTA */}
      <div className="pt-8">
        <button
          disabled={saving}
          type="submit"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary text-lg font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Delete link (safe treatment) */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="text-sm font-medium text-slate-400 transition-colors hover:text-primary"
        >
          Delete this book record
        </button>
      </div>
    </form>
  );
}
