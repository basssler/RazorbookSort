"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useEffect, useId, useRef, useState } from "react";

const SCAN_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
] as const;

function getScanBox(viewfinderWidth: number, viewfinderHeight: number) {
  const width = Math.max(300, Math.min(Math.floor(viewfinderWidth * 0.96), 480));
  const height = Math.max(180, Math.min(Math.floor(viewfinderHeight * 0.52), 260));
  return { width, height };
}

export function BarcodeScanner({
  paused,
  onDetected,
  onPermissionState,
}: {
  paused?: boolean;
  onDetected: (rawValue: string) => Promise<void> | void;
  onPermissionState?: (state: "loading" | "ready" | "denied" | "unsupported" | "error") => void;
}) {
  const elementId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "unsupported" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function startScanner() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        if (!active) {
          return;
        }
        setStatus("unsupported");
        onPermissionState?.("unsupported");
        return;
      }

      const scanner = new Html5Qrcode(elementId, {
        formatsToSupport: [...SCAN_FORMATS],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });

      scannerRef.current = scanner;

      try {
        await scanner.start(
          {
            facingMode: { exact: "environment" },
          },
          {
            fps: 10,
            qrbox: getScanBox,
            disableFlip: true,
            videoConstraints: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              advanced: [
                { focusMode: "continuous" },
                { zoom: 2 },
              ] as unknown as MediaTrackConstraintSet[],
            },
          },
          async (decodedText) => {
            if (lockRef.current || paused) {
              return;
            }

            lockRef.current = true;
            try {
              await onDetected(decodedText);
            } finally {
              if (!paused) {
                lockRef.current = false;
              }
            }
          },
          () => {
            // Ignore frame decode misses.
          },
        );

        if (!active) {
          try {
            await scanner.stop();
          } catch {
            // Ignore stop failures during teardown.
          }
          try {
            scanner.clear();
          } catch {
            // Ignore clear failures during teardown.
          }
          return;
        }

        setStatus("ready");
        onPermissionState?.("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        if (/aborterror|removed from the document|interrupted/i.test(message)) {
          return;
        }

        const nextStatus =
          error instanceof Error && /permission|denied|notallowed/i.test(error.message) ? "denied" : "error";
        setStatus(nextStatus);
        onPermissionState?.(nextStatus);
      }
    }

    void startScanner();

    return () => {
      active = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        void (async () => {
          try {
            await scanner.stop();
          } catch {
            // Ignore stop failures during teardown.
          }
          try {
            scanner.clear();
          } catch {
            // Ignore clear failures during teardown.
          }
        })();
      }
    };
  }, [elementId, onDetected, onPermissionState, paused]);

  useEffect(() => {
    lockRef.current = Boolean(paused);
  }, [paused]);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-[2rem] border border-line bg-ink shadow-card">
        <div id={elementId} className="min-h-[22rem] bg-neutral-950" />
      </div>
      <p className="text-sm text-muted">
        {status === "loading" && "Starting camera..."}
        {status === "ready" &&
          "Aim at the barcode on the back cover, fill most of the frame width, and hold 6 to 10 inches away. Move slowly closer if the code is small."}
        {status === "denied" && "Camera access was denied. Use manual ISBN entry below."}
        {status === "unsupported" && "Camera scanning is unavailable in this browser. Use manual ISBN entry below."}
        {status === "error" && "Camera could not be started. Use manual ISBN entry below."}
      </p>
    </div>
  );
}
