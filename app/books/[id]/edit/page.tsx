import { AppShell } from "@/components/app-shell";
import { RouteStub } from "@/components/route-stub";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell currentPath="/inventory">
      <RouteStub
        eyebrow="Edit Book"
        title={`Edit record ${id}`}
        description="The edit screen route is in place for v1. Form fields and persistence are intentionally deferred to a later milestone."
      />
    </AppShell>
  );
}
