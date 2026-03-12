import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { InventoryClient } from "@/components/inventory-client";
import { Icon } from "@/components/ui/icon";

export default function InventoryPage() {
  return (
    <AppShell
      currentPath="/inventory"
      pageTitle="Inventory List"
      showBack
      headerAction={
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90">
          <Icon name="download" />
        </button>
      }
    >
      <ActiveBatchGuard>
        <InventoryClient />
      </ActiveBatchGuard>
    </AppShell>
  );
}
