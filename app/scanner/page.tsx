import { AppShell } from "@/components/app-shell";
import { ScannerClient } from "@/components/scanner-client";
import { listBatches } from "@/lib/db";

export default async function ScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const batches = await listBatches();
  const activeBatchId = params.batchId ?? batches[0]?.id ?? null;

  return (
    <AppShell currentPath="/scanner">
      <ScannerClient batchId={activeBatchId} batches={batches} saved={params.saved === "1"} />
    </AppShell>
  );
}
