"use client";

import { useEffect, useState } from "react";

import { BatchSelector } from "@/components/batch-selector";
import { CreateBatchForm } from "@/components/create-batch-form";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useActiveBatch } from "@/hooks/use-active-batch";
import { Batch } from "@/lib/app-types";

export function HomePageClient({ batches }: { batches: Batch[] }) {
  const [batchOptions, setBatchOptions] = useState(batches);
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
    <div className="flex flex-col gap-4 p-4">
      {/* Active batch section */}
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Active batch</p>
          <p className="mt-2 text-sm text-slate-500">Select the intake batch that volunteers will use for this session.</p>
        </div>
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
      </Card>

      {/* Create batch section */}
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Create batch</p>
          <p className="mt-2 text-sm text-slate-500">Use one batch per pickup, donation drive, or sorting session.</p>
        </div>
        <CreateBatchForm
          onCreated={(batch) => {
            setBatchOptions((current) => [batch, ...current]);
            setActiveBatch({ id: batch.id, name: batch.name });
          }}
        />
      </Card>

      {/* Status banner */}
      <Card>
        <p className="text-sm text-slate-500">
          {hasHydrated && activeBatch
            ? `Current selection: ${activeBatch.name}`
            : "No active batch selected yet. Choose or create one to continue to the scanner."}
        </p>
      </Card>

      {/* Recent batches */}
      {batchOptions.length > 0 && (
        <div>
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
                  <p className="text-xs text-slate-400">
                    {batch.status === "active" ? "Active" : "Closed"}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
