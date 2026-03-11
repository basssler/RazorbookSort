"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextArea, TextInput } from "@/components/ui/field";

type Draft = {
  batchId: string;
  isbn10: string | null;
  isbn13: string | null;
  normalizedIsbn: string;
  title: string;
  authors: string;
  quantity: number;
  notes: string;
};

export function ConfirmBookForm({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [authors, setAuthors] = useState(draft.authors);
  const [quantity, setQuantity] = useState(String(draft.quantity));
  const [notes, setNotes] = useState(draft.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId: draft.batchId,
        isbn10: draft.isbn10,
        isbn13: draft.isbn13,
        normalizedIsbn: draft.normalizedIsbn,
        title: String(formData.get("title") ?? ""),
        authors: String(formData.get("authors") ?? ""),
        quantity: Number(formData.get("quantity") ?? 1),
        notes: String(formData.get("notes") ?? ""),
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to save book.");
      return;
    }

    router.push(`/scanner?batchId=${draft.batchId}&saved=1`);
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <FieldShell label="Title">
        <TextInput name="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </FieldShell>
      <FieldShell label="Authors">
        <TextInput name="authors" value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder="Author or authors" />
      </FieldShell>
      <div className="grid grid-cols-2 gap-3">
        <FieldShell label="ISBN">
          <TextInput value={draft.isbn13 ?? draft.isbn10 ?? ""} readOnly />
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
        <TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional intake note" />
      </FieldShell>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <Button disabled={saving} type="submit">
        {saving ? "Saving..." : "Save And Return To Scanner"}
      </Button>
    </form>
  );
}
