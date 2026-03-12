"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BatchSelector } from "@/components/batch-selector";
import { CreateBatchForm } from "@/components/create-batch-form";
import { Icon } from "@/components/ui/icon";
import { useActiveBatch } from "@/hooks/use-active-batch";
import { Batch } from "@/lib/app-types";

export function HomePageClient({ batches }: { batches: Batch[] }) {
  const [batchOptions, setBatchOptions] = useState(batches);
  const [showCreate, setShowCreate] = useState(false);
  const { activeBatch, hasHydrated, setActiveBatch, clearActiveBatch } = useActiveBatch();

  useEffect(() => {
    if (!hasHydrated || !activeBatch) {
      return;
    }

    const matchingBatch = batchOptions.find((batch) => batch.id === activeBatch.id);
    if (!matchingBatch) {
      clearActiveBatch();
    }
  }, [activeBatch, batchOptions, clearActiveBatch, hasHydrated]);

  const selectedBatchId =
    activeBatch && batchOptions.some((batch) => batch.id === activeBatch.id) ? activeBatch.id : "";

  return (
    <div className="flex flex-col">
      {/* ── Search Bar ── */}
      <div className="px-4 pb-2 pt-6">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50">
            <Icon name="search" />
          </span>
          <input
            className="h-12 w-full rounded-xl border border-primary/20 bg-white pl-10 pr-4 text-charcoal placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search Inventory"
            type="text"
            readOnly
            onClick={() => {
              window.location.href = "/inventory";
            }}
          />
        </div>
      </div>

      {/* ── Primary Actions ── */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <Link
          href="/scan"
          className="flex flex-col items-center justify-center gap-2 rounded-lg bg-primary p-5 text-white shadow-md transition-all active:scale-95"
        >
          <Icon name="barcode_scanner" size="text-3xl" />
          <span className="text-sm font-bold">Start Scanning</span>
        </Link>
        {activeBatch ? (
          <a
            href={`/api/batches/${activeBatch.id}/export`}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white p-5 text-charcoal shadow-sm transition-all active:scale-95"
          >
            <Icon name="export_notes" size="text-3xl" className="text-primary" />
            <span className="text-sm font-bold">Export Batch</span>
          </a>
        ) : (
          <button
            disabled
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/10 bg-white p-5 text-charcoal/40 shadow-sm"
          >
            <Icon name="export_notes" size="text-3xl" />
            <span className="text-sm font-bold">Export Batch</span>
          </button>
        )}
      </div>

      {/* ── Active Batch Section ── */}
      <div className="px-4 py-4">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-charcoal">
          <span className="size-2 rounded-full bg-green-500" />
          Active Batch
        </h2>

        {hasHydrated && activeBatch ? (
          /* ── Hero Card ── */
          <div className="flex flex-col overflow-hidden rounded-lg border border-primary/5 bg-white shadow-sm">
            {/* Image banner */}
            <div
              className="relative aspect-[16/6] w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqO7dwzZdX8Wzh2YKTVhwmslqzKeErge-JuQjxadqD3szgmiDJT5q19J7BWo2qRYgy33lB6MMCL1fey4vLKlCNU38VUO6dEyzBtIseVbC1Yyh1av9Kfwv21vaKWFvErmE29EcsyhN2knnBgvSemi3ur_BiX0kxsjakMeDxXEWBEDjNJ4EzSdlPn0Mv5Pth_aYWvtSQEPoj7Nq3jJzR_uUhIxyuLu59bPDin1xue2dSjLXuE_xiOmLakzx2iVSYrfAgCXMc8A0LhyM')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">Current Session</p>
                <p className="text-xl font-bold">{activeBatch.name}</p>
              </div>
            </div>

            {/* Card footer */}
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="flex items-center gap-1 text-sm text-charcoal/70">
                    <Icon name="schedule" size="text-sm" /> Started at{" "}
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p className="text-base font-semibold text-primary">
                    {batchOptions.length} batch{batchOptions.length !== 1 ? "es" : ""} loaded
                  </p>
                </div>
                <Link
                  href="/inventory"
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 flex items-center"
                >
                  View Details
                </Link>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── No batch state — batch selector + create ── */
          <div className="flex flex-col gap-4 rounded-lg border border-primary/5 bg-white p-4 shadow-sm">
            <p className="text-sm text-charcoal/70">
              No active batch selected. Choose or create one to start scanning.
            </p>
            <BatchSelector
              batches={batchOptions}
              selectedBatchId={selectedBatchId}
              onSelect={(batch) => {
                if (batch) {
                  setActiveBatch({ id: batch.id, name: batch.name });
                } else {
                  clearActiveBatch();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="text-sm font-semibold text-primary"
            >
              {showCreate ? "Cancel" : "+ Create new batch"}
            </button>
            {showCreate && (
              <CreateBatchForm
                onCreated={(batch) => {
                  setBatchOptions((current) => [batch, ...current]);
                  setActiveBatch({ id: batch.id, name: batch.name });
                  setShowCreate(false);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Session Stats ── */}
      <div className="px-4 py-2">
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl border border-primary/10 bg-primary/5 p-5">
            <p className="mb-1 text-sm font-medium text-charcoal/60">Session Total</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold leading-none text-charcoal">
                {batchOptions.length.toLocaleString()}
              </p>
              <p className="flex items-center text-sm font-bold text-green-600">+12%</p>
            </div>
          </div>
          <div className="flex-1 rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
            <p className="mb-1 text-sm font-medium text-charcoal/60">Accuracy</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold leading-none text-charcoal">99.8%</p>
              <Icon name="verified" className="text-xl text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Batch Selector (when batch is active, inline below stats) ── */}
      {hasHydrated && activeBatch && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-primary/5 bg-white p-3 shadow-sm">
            <div className="flex-1">
              <BatchSelector
                batches={batchOptions}
                selectedBatchId={selectedBatchId}
                onSelect={(batch) => {
                  if (batch) {
                    setActiveBatch({ id: batch.id, name: batch.name });
                  } else {
                    clearActiveBatch();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors active:bg-primary/20"
            >
              <Icon name="add" />
            </button>
          </div>
          {showCreate && (
            <div className="mt-3 rounded-lg border border-primary/5 bg-white p-4 shadow-sm">
              <CreateBatchForm
                onCreated={(batch) => {
                  setBatchOptions((current) => [batch, ...current]);
                  setActiveBatch({ id: batch.id, name: batch.name });
                  setShowCreate(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Recent Batches ── */}
      {batchOptions.length > 0 && (
        <div className="px-4 py-6">
          <h3 className="mb-3 font-bold text-charcoal">Recent Batches</h3>
          <div className="space-y-3">
            {batchOptions.slice(0, 5).map((batch) => (
              <button
                key={batch.id}
                onClick={() => setActiveBatch({ id: batch.id, name: batch.name })}
                className="flex w-full items-center gap-3 rounded-lg border border-primary/5 bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
              >
                <div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
                  <Icon name="inventory_2" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold">{batch.name}</p>
                  <p className="text-xs text-charcoal/50">
                    {batch.source_location ?? batch.status}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-charcoal/30" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
