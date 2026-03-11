"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextArea, TextInput } from "@/components/ui/field";
import { Book } from "@/lib/app-types";

export function EditBookForm({ book }: { book: Book }) {
  const router = useRouter();
  const [title, setTitle] = useState(book.title ?? "");
  const [authors, setAuthors] = useState(book.authors ?? "");
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
        normalizedIsbn: book.normalized_isbn,
        title: String(formData.get("title") ?? ""),
        authors: String(formData.get("authors") ?? ""),
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

    router.push(`/inventory?batchId=${book.batch_id}`);
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <FieldShell label="Title">
        <TextInput name="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </FieldShell>
      <FieldShell label="Authors">
        <TextInput name="authors" value={authors} onChange={(event) => setAuthors(event.target.value)} />
      </FieldShell>
      <div className="grid grid-cols-2 gap-3">
        <FieldShell label="ISBN-13">
          <TextInput value={book.isbn_13 ?? ""} readOnly />
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
      <FieldShell label="Notes">
        <TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </FieldShell>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <Button disabled={saving} type="submit">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
