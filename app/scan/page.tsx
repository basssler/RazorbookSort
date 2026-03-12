import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { ScannerClient } from "@/components/scanner-client";
import { Icon } from "@/components/ui/icon";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      currentPath="/scan"
      pageTitle="Scanner"
      showBack
      hideNav
      headerAction={
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10">
          <Icon name="more_vert" />
        </button>
      }
    >
      <ActiveBatchGuard>
        <ScannerClient saved={params.saved === "1"} />
      </ActiveBatchGuard>
    </AppShell>
  );
}
