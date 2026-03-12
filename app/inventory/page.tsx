import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { InventoryClient } from "@/components/inventory-client";

export default function InventoryPage() {
  return (
    <AppShell currentPath="/inventory">
      <ActiveBatchGuard>
        <InventoryClient />
      </ActiveBatchGuard>
    </AppShell>
  );
}
