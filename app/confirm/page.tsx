import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { RouteStub } from "@/components/route-stub";

export default function ConfirmPage() {
  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        <RouteStub
          eyebrow="Confirm"
          title="Confirm scanned book"
          description="This route now requires an active batch. Confirm and save behavior remains out of scope until milestone 6."
        />
      </ActiveBatchGuard>
    </AppShell>
  );
}
