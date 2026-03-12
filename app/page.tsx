import { AppShell } from "@/components/app-shell";
import { HomePageClient } from "@/components/home-page-client";
import { listBatches } from "@/lib/db";

export default async function HomePage() {
  const batches = await listBatches();

  return (
    <AppShell currentPath="/" pageTitle="Home Dashboard">
      <HomePageClient batches={batches} />
    </AppShell>
  );
}
