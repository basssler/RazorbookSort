"use client";

import { Batch } from "@/lib/app-types";
import { SelectInput } from "@/components/ui/field";

export function BatchSelector({
  batches,
  selectedBatchId,
  onSelect,
}: {
  batches: Batch[];
  selectedBatchId: string | null;
  onSelect: (batch: Batch | null) => void;
}) {
  return (
    <SelectInput
      value={selectedBatchId ?? ""}
      onChange={(event) => {
        onSelect(batches.find((batch) => batch.id === event.target.value) ?? null);
      }}
    >
      <option value="">Select a batch</option>
      {batches.map((batch) => (
        <option key={batch.id} value={batch.id}>
          {batch.name}
        </option>
      ))}
    </SelectInput>
  );
}
