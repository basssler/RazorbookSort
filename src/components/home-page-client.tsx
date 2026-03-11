"use client";

import { useEffect, useState } from "react";

import { BatchSelector } from "@/components/batch-selector";
import { CreateBatchForm } from "@/components/create-batch-form";
import { Card } from "@/components/ui/card";
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
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Active batch</p>
          <p className="mt-2 text-sm text-stone-600">Select the intake batch that volunteers will use for this session.</p>
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

      <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Create batch</p>
          <p className="mt-2 text-sm text-stone-600">Use one batch per pickup, donation drive, or sorting session.</p>
        </div>
        <CreateBatchForm
          onCreated={(batch) => {
            setBatchOptions((current) => [batch, ...current]);
            setActiveBatch({ id: batch.id, name: batch.name });
          }}
        />
      </Card>

      <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
        <p className="text-sm text-stone-600">
          {hasHydrated && activeBatch
            ? `Current selection: ${activeBatch.name}`
            : "No active batch selected yet. Choose or create one to continue to the scanner."}
        </p>
      </Card>
    </div>
  );
}
