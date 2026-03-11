import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { RouteStub } from "@/components/route-stub";

export default function ScanPage() {
  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        <RouteStub
          eyebrow="Scanner"
          title="Scan ISBN"
          description="Batch selection is now enforced. Camera scanning and manual ISBN entry are still deferred to milestone 4."
        />
      </ActiveBatchGuard>
    </AppShell>
  );
}
