"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/ui/icon";
import { useActiveBatch } from "@/hooks/use-active-batch";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
  /** Page title shown in center of header. */
  pageTitle?: string;
  /** Whether to show a back arrow in the header. */
  showBack?: boolean;
  /** Optional trailing element rendered in the header's right slot. */
  headerAction?: ReactNode;
  /** If true, the bottom nav is hidden (e.g. scanner full-screen mode). */
  hideNav?: boolean;
  /** If true, the header right-side icons (notification + profile) are hidden. */
  hideHeaderActions?: boolean;
};

export function AppShell({
  children,
  currentPath,
  pageTitle,
  showBack = false,
  headerAction,
  hideNav = false,
  hideHeaderActions = false,
}: AppShellProps) {
  const router = useRouter();
  const { activeBatch, hasHydrated } = useActiveBatch();

  const title = pageTitle ?? (hasHydrated && activeBatch ? activeBatch.name : "Razorbook Reach");

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* ---- Sticky header ---- */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-primary/10"
            >
              <Icon name="arrow_back" />
            </button>
          ) : (
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal">
              <Icon name="menu" />
            </button>
          )}
          <h1 className="text-xl font-bold leading-tight tracking-tight text-charcoal">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {headerAction ?? (
            hideHeaderActions ? null : (
              <>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name="notifications" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Icon name="person" />
                </button>
              </>
            )
          )}
        </div>
      </header>

      {/* ---- Main content ---- */}
      <main className={hideNav ? "flex-1" : "flex-1 pb-24"}>
        {children}
      </main>

      {/* ---- Bottom navigation ---- */}
      {!hideNav && <BottomNav currentPath={currentPath} />}
    </div>
  );
}
