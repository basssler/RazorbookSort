"use client";

import { useEffect, useState } from "react";

import { BookListItem } from "@/components/book-list-item";
import { Icon } from "@/components/ui/icon";
import { StatusBanner } from "@/components/ui/status-banner";
import { TextInput } from "@/components/ui/field";
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
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-primary/20 shadow-sm">
          <div className="flex items-center justify-center bg-white pl-4 text-primary">
            <Icon name="search" />
          </div>
          <input
            className="flex w-full min-w-0 flex-1 border-none bg-white px-4 py-3 text-base text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-0"
            placeholder="Search books or authors"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-3 overflow-x-auto px-4 py-2">
        <FilterPill
          label="Batch"
          value={activeBatch?.name ?? "All"}
        />
        <FilterPill
          label="Status"
          value={intakeStatus || "All"}
          options={INTAKE_STATUSES}
          onChange={setIntakeStatus}
        />
        <FilterPill
          label="Bin"
          value={binLabel || "All"}
          options={BIN_LABELS}
          onChange={setBinLabel}
        />
      </div>

      {/* Book list */}
      {loading ? (
        <div className="px-4 py-4">
          <StatusBanner tone="info">Loading inventory...</StatusBanner>
        </div>
      ) : error ? (
        <div className="px-4 py-4">
          <StatusBanner tone="error">{error}</StatusBanner>
        </div>
      ) : (
        <div className="mt-2 flex flex-col">
          {books.length > 0 ? (
            books.map((book) => <BookListItem key={book.id} book={book} />)
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No books found for this batch and filter combination.
            </div>
          )}
        </div>
      )}

      {/* Export CSV */}
      {activeBatch && (
        <div className="px-4 py-6">
          <a
            href={`/api/batches/${activeBatch.id}/export`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Icon name="file_export" size="text-xl" />
            Export CSV
          </a>
        </div>
      )}
    </div>
  );
}

/* ——— Filter pill sub-component ——— */

function FilterPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options?: readonly string[];
  onChange?: (value: string) => void;
}) {
  if (!options || !onChange) {
    // Display-only pill
    return (
      <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-white px-4">
        <span className="text-sm font-semibold text-charcoal">{label}</span>
        <Icon name="keyboard_arrow_down" className="text-sm text-primary" />
      </div>
    );
  }

  return (
    <select
      className="flex h-9 shrink-0 appearance-none items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 text-sm font-semibold text-charcoal outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
      value={value === "All" ? "" : value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All {label}s</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
