"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { DuplicateModal } from "@/components/scanner/duplicate-modal";
import { ManualEntry } from "@/components/scanner/manual-entry";
import { Icon } from "@/components/ui/icon";
import { StatusBanner } from "@/components/ui/status-banner";
import { useActiveBatch } from "@/hooks/use-active-batch";
import { Book } from "@/types";

type PermissionState = "loading" | "ready" | "denied" | "unsupported" | "error";

function playSuccessBeep() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(context.destination);

  const now = context.currentTime;
  oscillator.start(now);
  oscillator.stop(now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  oscillator.onended = () => {
    void context.close().catch(() => undefined);
  };
}

export function ScannerClient({ saved = false }: { saved?: boolean }) {
  const router = useRouter();
  const { activeBatch } = useActiveBatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(saved ? "Book saved. Ready for the next scan." : "");
  const [permissionState, setPermissionState] = useState<PermissionState>("loading");
  const [duplicateBook, setDuplicateBook] = useState<Book | null>(null);
  const [showManual, setShowManual] = useState(false);
  const lastHandledRef = useRef<string>("");

  useEffect(() => {
    lastHandledRef.current = "";
    setDuplicateBook(null);
    if (!saved) {
      setMessage("");
    }
  }, [activeBatch?.id, saved]);

  async function submitIsbn(rawIsbn: string) {
    if (!activeBatch || busy || duplicateBook) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn: rawIsbn, batchId: activeBatch.id }),
    });

    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to process this ISBN.");
      return;
    }

    if (payload.mode === "duplicate") {
      setDuplicateBook(payload.book as Book);
      return;
    }

    if (lastHandledRef.current === payload.normalizedIsbn) {
      return;
    }

    lastHandledRef.current = payload.normalizedIsbn;
    playSuccessBeep();

    const params = new URLSearchParams({
      isbn: payload.normalizedIsbn,
      batchId: activeBatch.id,
    });

    if (payload.isbn10) {
      params.set("isbn10", payload.isbn10);
    }
    if (payload.isbn13) {
      params.set("isbn13", payload.isbn13);
    }

    router.push(`/confirm?${params.toString()}`);
  }

  async function handleAddCopy() {
    if (!duplicateBook) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const response = await fetch(`/api/books/${duplicateBook.id}/increment`, {
      method: "POST",
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to increment quantity.");
      return;
    }

    setDuplicateBook(null);
    setMessage(`Added another copy to ${payload.book.title || "the existing record"}.`);
    lastHandledRef.current = "";
  }

  function handleOpenRecord() {
    if (!duplicateBook) {
      return;
    }

    router.push(`/books/${duplicateBook.id}/edit`);
  }

  function handleCancelDuplicate() {
    setDuplicateBook(null);
    setMessage("Duplicate dismissed. Ready to keep scanning.");
    lastHandledRef.current = "";
  }

  return (
    <div className="relative flex flex-1 flex-col bg-slate-800">
      {/* ── Full-screen camera area ── */}
      <div className="relative flex-1">
        {/* Camera viewfinder */}
        <BarcodeScanner
          paused={busy || Boolean(duplicateBook)}
          onDetected={submitIsbn}
          onPermissionState={setPermissionState}
        />

        {/* Scanning frame overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="relative h-64 w-full max-w-md overflow-hidden rounded-xl border-2 border-primary/50">
            {/* Corner brackets */}
            <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary" />
            {/* Scanning line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_#9b2234]" />
          </div>
        </div>
      </div>

      {/* ── Lower controls ── */}
      <div className="relative z-10 flex flex-col gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-6">
        {/* Status messages */}
        {busy && <StatusBanner tone="info">Processing scan...</StatusBanner>}
        {message && <StatusBanner tone="success">{message}</StatusBanner>}
        {error && <StatusBanner tone="error">{error}</StatusBanner>}

        {/* Duplicate modal */}
        {duplicateBook && (
          <DuplicateModal
            book={duplicateBook}
            busy={busy}
            onAddCopy={handleAddCopy}
            onOpenRecord={handleOpenRecord}
            onCancel={handleCancelDuplicate}
          />
        )}

        {/* Manual entry toggle */}
        {showManual ? (
          <div className="rounded-xl border border-primary/20 bg-white/90 p-4 shadow-xl backdrop-blur-md">
            <ManualEntry
              disabled={busy || Boolean(duplicateBook)}
              onSubmitIsbn={(isbn) => {
                setShowManual(false);
                return submitIsbn(isbn);
              }}
            />
          </div>
        ) : null}

        {/* Quick actions bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
          >
            <Icon name="keyboard" size="text-lg" />
            Manual ISBN Entry
          </button>
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-primary"
          >
            Review &amp; Finish
            <Icon name="chevron_right" size="text-sm" />
          </Link>
        </div>

        {/* Batch progress */}
        <div className="flex justify-center">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            {permissionState === "ready" ? "Scanning active" : "Waiting for camera"}{" "}
            • {activeBatch?.name ?? "No batch"}
          </p>
        </div>
      </div>
    </div>
  );
}
