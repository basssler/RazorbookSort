"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { StatusBanner } from "@/components/ui/status-banner";
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
    return <StatusBanner tone="info">Loading active batch...</StatusBanner>;
  }

  if (!activeBatch) {
    return <StatusBanner tone="warning">Redirecting to batch selection...</StatusBanner>;
  }

  return <>{children}</>;
}
