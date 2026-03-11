"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useActiveBatch } from "@/hooks/use-active-batch";

export function ActiveBatchGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { activeBatch, hasHydrated } = useActiveBatch();

  useEffect(() => {
    if (hasHydrated && !activeBatch) {
      router.replace("/");
    }
  }, [activeBatch, hasHydrated, router]);

  if (!hasHydrated) {
    return <p className="px-2 py-6 text-sm text-stone-600">Loading active batch...</p>;
  }

  if (!activeBatch) {
    return <p className="px-2 py-6 text-sm text-stone-600">Redirecting to batch selection...</p>;
  }

  return <>{children}</>;
}
