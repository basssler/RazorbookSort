import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { ScannerClient } from "@/components/scanner-client";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        <ScannerClient saved={params.saved === "1"} />
      </ActiveBatchGuard>
    </AppShell>
  );
}
