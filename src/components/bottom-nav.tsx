import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/scan", label: "Scan" },
  { href: "/inventory", label: "Inventory" },
  { href: "/", label: "Batch" },
];

export function BottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md gap-2">
        {navItems.map((item) => {
          const active = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-1 items-center justify-center rounded-2xl px-3 text-sm font-semibold transition-colors",
                active ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
