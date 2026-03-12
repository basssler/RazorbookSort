import { redirect } from "next/navigation";

export default async function LegacyScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  redirect(params.saved === "1" ? "/scan?saved=1" : "/scan");
}
