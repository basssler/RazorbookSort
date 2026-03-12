import { AppShell } from "@/components/app-shell";
import { ActiveBatchGuard } from "@/components/active-batch-guard";
import { Card } from "@/components/ui/card";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ isbn?: string; isbn10?: string; isbn13?: string }>;
}) {
  const params = await searchParams;
  const scannedIsbn = params.isbn13 ?? params.isbn10 ?? params.isbn ?? "";

  return (
    <AppShell currentPath="/scan">
      <ActiveBatchGuard>
        <Card className="flex flex-col gap-4 rounded-3xl border-stone-200 bg-white shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Confirm</p>
            <p className="mt-2 text-sm text-stone-600">
              Milestone 4 stops at scan and handoff. Save behavior starts in milestone 6.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Scanned ISBN</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">{scannedIsbn || "No ISBN received"}</p>
          </div>
        </Card>
      </ActiveBatchGuard>
    </AppShell>
  );
}
