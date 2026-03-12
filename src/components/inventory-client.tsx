"use client";

import { useEffect, useState } from "react";

import { BookListItem } from "@/components/book-list-item";
import { Card } from "@/components/ui/card";
import { FieldShell, SelectInput, TextInput } from "@/components/ui/field";
import { useActiveBatch } from "@/hooks/use-active-batch";
import { BIN_LABELS, Book, INTAKE_STATUSES } from "@/types";

export function InventoryClient() {
  const { activeBatch } = useActiveBatch();
  const [search, setSearch] = useState("");
  const [binLabel, setBinLabel] = useState("");
  const [intakeStatus, setIntakeStatus] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      if (!activeBatch) {
        return;
      }

      setLoading(true);
      setError("");

      const params = new URLSearchParams({ batchId: activeBatch.id });
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (binLabel) {
        params.set("binLabel", binLabel);
      }
      if (intakeStatus) {
        params.set("intakeStatus", intakeStatus);
      }

      const response = await fetch(`/api/books?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        setBooks([]);
        setError(payload.error ?? "Unable to load inventory.");
        setLoading(false);
        return;
      }

      setBooks(payload.books ?? []);
      setLoading(false);
    }

    void loadBooks();
  }, [activeBatch, binLabel, intakeStatus, search]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Inventory</p>
          <p className="mt-2 text-sm text-stone-600">
            {activeBatch ? `Browsing books in ${activeBatch.name}.` : "Select an active batch first."}
          </p>
        </div>
        <FieldShell label="Search by title, author, or ISBN">
          <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Magic Tree House or 978..." />
        </FieldShell>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldShell label="Bin label">
            <SelectInput value={binLabel} onChange={(event) => setBinLabel(event.target.value)}>
              <option value="">All bin labels</option>
              {BIN_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
          <FieldShell label="Intake status">
            <SelectInput value={intakeStatus} onChange={(event) => setIntakeStatus(event.target.value)}>
              <option value="">All statuses</option>
              {INTAKE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
        </div>
      </Card>

      {loading ? <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">Loading inventory...</Card> : null}
      {error ? <Card className="rounded-3xl border-stone-200 bg-white text-red-700 shadow-sm">{error}</Card> : null}

      {!loading && !error ? (
        <div className="flex flex-col gap-3">
          {books.length > 0 ? (
            books.map((book) => <BookListItem key={book.id} book={book} />)
          ) : (
            <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
              No books found for this batch and filter combination.
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
