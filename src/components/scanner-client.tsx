"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { ManualEntry } from "@/components/scanner/manual-entry";
import { Card } from "@/components/ui/card";
import { useActiveBatch } from "@/hooks/use-active-batch";

type PermissionState = "loading" | "ready" | "denied" | "unsupported" | "error";

function playSuccessBeep() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

export function ScannerClient() {
  const router = useRouter();
  const { activeBatch } = useActiveBatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [permissionState, setPermissionState] = useState<PermissionState>("loading");
  const lastHandledRef = useRef<string>("");

  useEffect(() => {
    lastHandledRef.current = "";
  }, [activeBatch?.id]);

  async function submitIsbn(rawIsbn: string) {
    if (!activeBatch) {
      setError("Select an active batch before scanning.");
      return;
    }

    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn: rawIsbn }),
    });

    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to process this ISBN.");
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

      <BarcodeScanner paused={busy} onDetected={submitIsbn} onPermissionState={setPermissionState} />

      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <p className="text-sm font-semibold text-ink">Manual fallback</p>
        <ManualEntry disabled={busy} onSubmitIsbn={submitIsbn} />
      </Card>

      {error ? <p className="rounded-3xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
