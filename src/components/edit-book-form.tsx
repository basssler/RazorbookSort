"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, SelectInput, TextArea, TextInput } from "@/components/ui/field";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    const response = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isbn10: book.isbn_10,
        isbn13: book.isbn_13,
        title: String(formData.get("title") ?? ""),
        authors: String(formData.get("authors") ?? ""),
        publisher: String(formData.get("publisher") ?? ""),
        publishedYear: formData.get("publishedYear") ? Number(formData.get("publishedYear")) : null,
        thumbnailUrl: String(formData.get("thumbnailUrl") ?? ""),
        binLabel: String(formData.get("binLabel") ?? ""),
        intakeStatus: String(formData.get("intakeStatus") ?? ""),
        quantity: Number(formData.get("quantity") ?? 1),
        notes: String(formData.get("notes") ?? ""),
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
      <FieldShell label="Title">
        <TextInput name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </FieldShell>

      <FieldShell label="Author">
        <TextInput name="authors" value={authors} onChange={(event) => setAuthors(event.target.value)} />
      </FieldShell>

      <FieldShell label="ISBN">
        <TextInput value={book.isbn_13 ?? book.isbn_10 ?? ""} readOnly />
      </FieldShell>

      <FieldShell label="Publisher">
        <TextInput name="publisher" value={publisher} onChange={(event) => setPublisher(event.target.value)} />
      </FieldShell>

      <div className="grid grid-cols-2 gap-4">
        <FieldShell label="Year">
          <TextInput
            name="publishedYear"
            inputMode="numeric"
            value={publishedYear}
            onChange={(event) => setPublishedYear(event.target.value)}
            placeholder="2024"
          />
        </FieldShell>
        <FieldShell label="Quantity">
          <TextInput
            name="quantity"
            inputMode="numeric"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </FieldShell>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldShell label="Bin label">
          <SelectInput name="binLabel" value={binLabel} onChange={(event) => setBinLabel(event.target.value)}>
            <option value="">Select bin</option>
            {BIN_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </SelectInput>
        </FieldShell>
        <FieldShell label="Intake status">
          <SelectInput name="intakeStatus" value={intakeStatus} onChange={(event) => setIntakeStatus(event.target.value)}>
            <option value="">Select status</option>
            {INTAKE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectInput>
        </FieldShell>
      </div>

      <FieldShell label="Thumbnail URL">
        <TextInput name="thumbnailUrl" value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} />
      </FieldShell>

      <FieldShell label="Notes">
        <TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
      </FieldShell>

      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

      <div className="pt-4">
        <Button disabled={saving} type="submit">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex justify-center pt-2">
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
