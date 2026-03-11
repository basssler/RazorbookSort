import { AppShell } from "@/components/app-shell";
import { HomePageClient } from "@/components/home-page-client";
import { listBatches } from "@/lib/db";

export default async function HomePage() {
  const batches = await listBatches();

  return (
    <AppShell currentPath="/">
      <HomePageClient batches={batches} />
    </AppShell>
  );
}
