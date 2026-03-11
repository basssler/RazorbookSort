import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { RouteStub } from "@/components/route-stub";

export default function InventoryPage() {
  return (
    <AppShell currentPath="/inventory">
      <ActiveBatchGuard>
        <RouteStub
          eyebrow="Inventory"
          title="Browse batch inventory"
          description="This route now requires an active batch. Inventory data and search behavior remain deferred to milestone 3."
        />
      </ActiveBatchGuard>
    </AppShell>
  );
}
