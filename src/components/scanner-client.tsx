"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextInput } from "@/components/ui/field";
import { Batch } from "@/lib/app-types";

type ScannerClientProps = {
  batchId: string | null;
  batches: Batch[];
  saved: boolean;
};

type DuplicateBook = {
  id: string;
  title: string;
  authors: string | null;
  quantity: number;
};

export function ScannerClient({ batchId, batches, saved }: ScannerClientProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");
  const [message, setMessage] = useState(saved ? "Book saved. Ready for the next scan." : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateBook | null>(null);

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === batchId) ?? null,
    [batchId, batches],
  );

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    async function startCamera() {
      if (!videoRef.current || !selectedBatch) {
        setCameraReady(false);
        return;
      }

      if (!("mediaDevices" in navigator) || !("BarcodeDetector" in window)) {
        setCameraReady(false);
        return;
      }

      try {
        const supported = await BarcodeDetector.getSupportedFormats();
        const formats = supported.filter((format) => ["ean_13", "ean_8", "upc_a", "upc_e"].includes(format));
        detectorRef.current = new BarcodeDetector({
          formats: formats.length > 0 ? formats : ["ean_13", "ean_8", "upc_a", "upc_e"],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        activeRef.current = true;
        setCameraReady(true);

        const scanFrame = async () => {
          if (!activeRef.current || !videoRef.current || busyRef.current || !detectorRef.current) {
            frameRef.current = window.requestAnimationFrame(scanFrame);
            return;
          }

          try {
            const results = await detectorRef.current.detect(videoRef.current);
            const value = results.find((item) => item.rawValue)?.rawValue;
            if (value) {
              activeRef.current = false;
              await submitLookup(value);
            }
          } catch {
            // Keep scanning on detector hiccups.
          }

          frameRef.current = window.requestAnimationFrame(scanFrame);
        };

        frameRef.current = window.requestAnimationFrame(scanFrame);
      } catch {
        setCameraReady(false);
      }
    }

    void startCamera();

    return () => {
      activeRef.current = false;
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [selectedBatch]);

  async function submitLookup(isbn: string) {
    if (!selectedBatch) {
      setError("Select a batch before scanning.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    setDuplicate(null);
    setManualIsbn("");

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: selectedBatch.id, isbn }),
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to scan this ISBN.");
      activeRef.current = true;
      return;
    }

    if (payload.mode === "duplicate") {
      setDuplicate(payload.book);
      return;
    }

    const params = new URLSearchParams({
      batchId: selectedBatch.id,
      normalizedIsbn: payload.draft.normalizedIsbn,
      quantity: String(payload.draft.quantity ?? 1),
    });

    if (payload.draft.isbn10) {
      params.set("isbn10", payload.draft.isbn10);
    }
    if (payload.draft.isbn13) {
      params.set("isbn13", payload.draft.isbn13);
    }
    if (payload.draft.title) {
      params.set("title", payload.draft.title);
    }
    if (payload.draft.authors) {
      params.set("authors", payload.draft.authors);
    }

    router.push(`/confirm?${params.toString()}`);
  }

  async function incrementDuplicate() {
    if (!duplicate) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/books/${duplicate.id}/increment`, { method: "POST" });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to increment quantity.");
      return;
    }

    setMessage(`Quantity updated for ${payload.book.title}.`);
    setDuplicate(null);
    activeRef.current = true;
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-panel border border-line bg-card p-4 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Current batch</p>
        <p className="mt-2 text-xl font-black text-ink">{selectedBatch?.name ?? "Pick a batch on the dashboard first"}</p>
        <p className="mt-1 text-sm text-muted">{selectedBatch?.location ?? "Batch selection is required before scanning."}</p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-line bg-ink shadow-card">
        <div className="relative aspect-[3/4] bg-neutral-950">
          {selectedBatch ? <video ref={videoRef} muted playsInline className="h-full w-full" /> : null}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="h-40 w-full rounded-[1.75rem] border-4 border-card/90" />
          </div>
        </div>
      </div>

      <div className="rounded-panel border border-line bg-card p-4 shadow-card">
        <p className="text-sm font-semibold text-ink">
          {cameraReady ? "Aim at the ISBN barcode." : "Camera scan unavailable in this browser. Use manual ISBN entry below."}
        </p>
        <p className="mt-2 text-sm text-muted">Duplicates in the same batch default to incrementing quantity.</p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submitLookup(manualIsbn);
        }}
      >
        <FieldShell label="Manual ISBN">
          <TextInput
            value={manualIsbn}
            onChange={(event) => setManualIsbn(event.target.value)}
            placeholder="9780142403877"
          />
        </FieldShell>
        <Button disabled={busy || !selectedBatch} type="submit">
          {busy ? "Checking..." : "Scan Or Enter ISBN"}
        </Button>
      </form>

      {message ? <p className="rounded-3xl bg-moss px-4 py-3 text-sm font-semibold text-white">{message}</p> : null}
      {error ? <p className="rounded-3xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

      {duplicate ? (
        <div className="flex flex-col gap-3 rounded-panel border border-accentDark bg-sand p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentDark">Duplicate detected</p>
          <p className="text-xl font-black text-ink">{duplicate.title}</p>
          <p className="text-sm text-muted">{`${duplicate.authors || "Unknown author"} - Qty ${duplicate.quantity}`}</p>
          <div className="flex flex-col gap-3">
            <Button disabled={busy} onClick={() => void incrementDuplicate()} type="button">
              {busy ? "Updating..." : "Increment Quantity"}
            </Button>
            <Link
              href={`/edit/${duplicate.id}`}
              className="rounded-3xl border border-line bg-card px-5 py-4 text-center text-base font-semibold text-muted"
            >
              Review Record Instead
            </Link>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setDuplicate(null);
                activeRef.current = true;
              }}
            >
              Cancel And Keep Scanning
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
