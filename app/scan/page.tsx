import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { ScannerClient } from "@/components/scanner-client";

export default function ScanPage() {
  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        <ScannerClient />
      </ActiveBatchGuard>
    </AppShell>
  );
}
