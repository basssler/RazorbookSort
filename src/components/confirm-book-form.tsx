"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { StatusBanner } from "@/components/ui/status-banner";
import { BIN_LABELS, INTAKE_STATUSES } from "@/types";
import { cn } from "@/lib/utils";

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

const STATUS_CONFIG: Record<string, { icon: string; label: string; activeClasses: string; inactiveClasses: string }> = {
  Keep: {
    icon: "check_circle",
    label: "Keep",
    activeClasses: "border-2 border-emerald-500/20 bg-emerald-50/50 text-emerald-600",
    inactiveClasses: "border border-slate-200 bg-white text-slate-400",
  },
  Review: {
    icon: "rate_review",
    label: "Review",
    activeClasses: "border-2 border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30",
    inactiveClasses: "border border-slate-200 bg-white text-slate-400",
  },
  Reject: {
    icon: "cancel",
    label: "Reject",
    activeClasses: "border-2 border-red-400/30 bg-red-50/50 text-red-500",
    inactiveClasses: "border border-slate-200 bg-white text-slate-400",
  },
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
  const [showDetails, setShowDetails] = useState(false);
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

    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId: draft.batchId,
        isbn10: draft.isbn10,
        isbn13: draft.isbn13,
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
      setError(payload.error ?? "Unable to save book.");
      return;
    }

    router.push("/scan?saved=1");
    router.refresh();
  }

  const displayIsbn = draft.isbn13 ?? draft.isbn10 ?? draft.normalizedIsbn;

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-0">
      {/* ── Book Card ── */}
      <div className="p-4">
        <div className="flex items-stretch justify-between gap-4 rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
          <div className="flex flex-[2_2_0px] flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-primary">
                ISBN: {displayIsbn}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-charcoal">
                {title || "Unknown Title"}
              </h1>
              <p className="text-base font-semibold text-slate-500">
                {authors || "Unknown Author"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-fit items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Icon name="edit" size="text-[18px]" />
              {showDetails ? "Hide Details" : "Edit Details"}
            </button>
          </div>

          {/* Thumbnail */}
          {thumbnailUrl ? (
            <div
              className="h-36 w-24 shrink-0 rounded-lg border border-slate-200 bg-cover bg-center bg-no-repeat shadow-md"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />
          ) : (
            <div className="flex h-36 w-24 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <Icon name="menu_book" size="text-3xl" className="text-slate-300" />
            </div>
          )}
        </div>
      </div>

      {/* ── Metadata loading indicator ── */}
      {metadataState === "loading" && (
        <div className="px-4">
          <StatusBanner tone="info">Looking up book details...</StatusBanner>
        </div>
      )}
      {metadataState === "empty" && (
        <div className="px-4">
          <StatusBanner tone="warning">No metadata found. You can still save this book.</StatusBanner>
        </div>
      )}
      {metadataState === "error" && (
        <div className="px-4">
          <StatusBanner tone="warning">Metadata lookup failed. You can still save this book.</StatusBanner>
        </div>
      )}

      {/* ── Collapsible Edit Details ── */}
      {showDetails && (
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-charcoal/60">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-charcoal/60">Authors</label>
              <input
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-charcoal/60">Publisher</label>
              <input
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-charcoal/60">Year</label>
              <input
                inputMode="numeric"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                placeholder="2024"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-charcoal/60">Qty</label>
              <input
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-charcoal/60">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional intake note"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      )}

      {/* ── Select Bin (2×4 grid) ── */}
      <div className="px-4 py-2">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold leading-tight tracking-tight text-charcoal">
          <Icon name="inventory_2" className="text-primary" />
          Select Bin
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {BIN_LABELS.map((label) => {
            const isUnknown = label === "Unknown";
            const isSelected = binLabel === label;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setBinLabel(label)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg text-sm font-bold transition-all active:scale-95",
                  isSelected
                    ? "border-2 border-primary bg-primary/10 text-primary shadow-sm"
                    : isUnknown
                      ? "border border-dashed border-slate-300 bg-slate-50/50 text-slate-400"
                      : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary/50",
                )}
              >
                {isUnknown ? <span className="italic font-semibold">{label}</span> : label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status Selector (3 icons) ── */}
      <div className="px-4 py-4">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold leading-tight tracking-tight text-charcoal">
          <Icon name="assignment_turned_in" className="text-primary" />
          Status
        </h3>
        <div className="flex gap-3">
          {INTAKE_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const isSelected = intakeStatus === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setIntakeStatus(status)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center rounded-xl py-4 transition-all",
                  isSelected ? config.activeClasses : config.inactiveClasses,
                )}
              >
                <Icon
                  name={config.icon}
                  size="text-[28px]"
                  filled={isSelected && status === "Review"}
                />
                <span className="mt-1 text-[11px] font-black uppercase tracking-tighter">
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-4">
          <StatusBanner tone="error">{error}</StatusBanner>
        </div>
      )}

      {/* ── Save + Scan Next CTA ── */}
      <div className="p-4">
        <button
          disabled={saving}
          type="submit"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-black uppercase tracking-tight text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          <span>{saving ? "Saving..." : "Save + Scan Next"}</span>
          {!saving && <Icon name="barcode_scanner" />}
        </button>
      </div>
    </form>
  );
}
