"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { DuplicateModal } from "@/components/scanner/duplicate-modal";
import { ManualEntry } from "@/components/scanner/manual-entry";
import { Card } from "@/components/ui/card";
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
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 rounded-3xl border-stone-200 bg-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Scanner</p>
        <p className="text-xl font-black text-ink">{activeBatch?.name ?? "No active batch selected"}</p>
        <p className="text-sm text-muted">
          {permissionState === "ready"
            ? "Camera scan is live. Try the barcode on the back cover first, then fall back to manual entry if the cover is glossy or damaged."
            : "If camera access fails, volunteers can keep moving with manual ISBN entry."}
        </p>
      </Card>

      <BarcodeScanner paused={busy || Boolean(duplicateBook)} onDetected={submitIsbn} onPermissionState={setPermissionState} />

      {duplicateBook ? (
        <DuplicateModal
          book={duplicateBook}
          busy={busy}
          onAddCopy={handleAddCopy}
          onOpenRecord={handleOpenRecord}
          onCancel={handleCancelDuplicate}
        />
      ) : null}

      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <p className="text-sm font-semibold text-ink">Manual fallback</p>
        <ManualEntry disabled={busy || Boolean(duplicateBook)} onSubmitIsbn={submitIsbn} />
      </Card>

      {message ? <p className="rounded-3xl bg-moss px-4 py-3 text-sm font-semibold text-white">{message}</p> : null}
      {error ? <p className="rounded-3xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
