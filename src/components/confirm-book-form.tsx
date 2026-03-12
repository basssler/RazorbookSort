"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/ui/status-banner";
import { FieldShell, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { BIN_LABELS, INTAKE_STATUSES } from "@/types";

type Draft = {
  batchId: string;
  isbn10: string | null;
  isbn13: string | null;
  normalizedIsbn: string;
  title: string;
  authors: string;
  publisher: string;
  publishedYear: string;
  thumbnailUrl: string;
  quantity: number;
  notes: string;
};

export function ConfirmBookForm({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [authors, setAuthors] = useState(draft.authors);
  const [publisher, setPublisher] = useState(draft.publisher);
  const [publishedYear, setPublishedYear] = useState(draft.publishedYear);
  const [thumbnailUrl, setThumbnailUrl] = useState(draft.thumbnailUrl);
  const [binLabel, setBinLabel] = useState("");
  const [intakeStatus, setIntakeStatus] = useState("Keep");
  const [quantity, setQuantity] = useState(String(draft.quantity));
  const [notes, setNotes] = useState(draft.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [metadataState, setMetadataState] = useState<"idle" | "loading" | "loaded" | "empty" | "error">("idle");

  useEffect(() => {
    let active = true;

    async function lookupMetadata() {
      if (!draft.normalizedIsbn) {
        return;
      }

      setMetadataState("loading");

      try {
        const response = await fetch(`/api/metadata?isbn=${encodeURIComponent(draft.normalizedIsbn)}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          setMetadataState("error");
          return;
        }

        const metadata = payload.metadata;
        if (!metadata) {
          setMetadataState("empty");
          return;
        }

        setTitle((current) => current || metadata.title || "");
        setAuthors((current) => current || metadata.authors || "");
        setPublisher((current) => current || metadata.publisher || "");
        setPublishedYear((current) => current || metadata.publishedYear || "");
        setThumbnailUrl((current) => current || metadata.thumbnailUrl || "");
        setMetadataState("loaded");
      } catch {
        if (active) {
          setMetadataState("error");
        }
      }
    }

    void lookupMetadata();

    return () => {
      active = false;
    };
  }, [draft.normalizedIsbn]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.normalizedIsbn || !binLabel || !intakeStatus) {
      setError("ISBN, bin label, and intake status are required.");
      return;
    }

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
      setError(payload.error ?? "Unable to save book.");
      return;
    }

    router.push("/scan?saved=1");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Scanned ISBN</p>
        <p className="mt-2 text-lg font-semibold text-stone-900">{draft.isbn13 ?? draft.isbn10 ?? draft.normalizedIsbn}</p>
      </div>
      {metadataState === "loading" ? <StatusBanner tone="info">Looking up book details...</StatusBanner> : null}
      {metadataState === "empty" ? (
        <StatusBanner tone="warning">No metadata found. You can still save this book.</StatusBanner>
      ) : null}
      {metadataState === "error" ? (
        <StatusBanner tone="warning">Metadata lookup failed. You can still save this book.</StatusBanner>
      ) : null}
      <FieldShell label="Bin label">
        <SelectInput name="binLabel" value={binLabel} onChange={(event) => setBinLabel(event.target.value)} required>
          <option value="">Select bin label</option>
          {BIN_LABELS.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </SelectInput>
      </FieldShell>
      <FieldShell label="Intake status">
        <SelectInput
          name="intakeStatus"
          value={intakeStatus}
          onChange={(event) => setIntakeStatus(event.target.value)}
          required
        >
          {INTAKE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </SelectInput>
      </FieldShell>
      <FieldShell label="Title">
        <TextInput name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </FieldShell>
      <FieldShell label="Authors">
        <TextInput name="authors" value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder="Author or authors" />
      </FieldShell>
      <FieldShell label="Publisher">
        <TextInput name="publisher" value={publisher} onChange={(event) => setPublisher(event.target.value)} />
      </FieldShell>
      <FieldShell label="Published year">
        <TextInput
          name="publishedYear"
          inputMode="numeric"
          value={publishedYear}
          onChange={(event) => setPublishedYear(event.target.value)}
          placeholder="2024"
        />
      </FieldShell>
      <FieldShell label="Thumbnail URL">
        <TextInput name="thumbnailUrl" value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} />
      </FieldShell>
      <FieldShell label="Quantity">
        <TextInput
          name="quantity"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </FieldShell>
      <FieldShell label="Notes">
        <TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional intake note" />
      </FieldShell>
      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
      <Button disabled={saving} type="submit">
        {saving ? "Saving..." : "Save + Scan Next"}
      </Button>
    </form>
  );
}
