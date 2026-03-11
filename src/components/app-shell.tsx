"use client";

import { ReactNode } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { useActiveBatch } from "@/hooks/use-active-batch";

export function AppShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath: string;
}) {
  const { activeBatch, hasHydrated } = useActiveBatch();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),transparent_28rem),linear-gradient(180deg,#f7f7f5_0%,#f0eee8_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4">
        <header className="mb-4 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Razorbook Reach Intake</p>
          <h1 className="mt-2 text-xl font-semibold text-stone-900">Mobile intake shell</h1>
          <p className="mt-3 text-sm text-stone-600">
            Active batch: {hasHydrated ? activeBatch?.name ?? "none selected" : "loading..."}
          </p>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <BottomNav currentPath={currentPath} />
    </div>
  );
}
