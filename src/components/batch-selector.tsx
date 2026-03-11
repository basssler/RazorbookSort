"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Batch } from "@/lib/app-types";
import { SelectInput } from "@/components/ui/field";

export function BatchSelector({
  batches,
  selectedBatchId,
}: {
  batches: Batch[];
  selectedBatchId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <SelectInput
      value={selectedBatchId ?? ""}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        if (event.target.value) {
          params.set("batchId", event.target.value);
        } else {
          params.delete("batchId");
        }
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
      }}
    >
      {batches.map((batch) => (
        <option key={batch.id} value={batch.id}>
          {batch.name}
        </option>
      ))}
    </SelectInput>
  );
}

