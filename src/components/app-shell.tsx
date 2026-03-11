import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/scanner", label: "Scanner" },
  { href: "/inventory", label: "Inventory" },
];

export function AppShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4 md:max-w-5xl md:px-6">
      <header className="mb-4 rounded-panel border border-line bg-card px-5 py-4 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accentDark">Razorbook Reach Intake</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Volunteer-first donation intake</h1>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md gap-2 border-t border-line bg-card/95 px-4 py-3 backdrop-blur md:max-w-5xl md:rounded-t-[2rem] md:border md:border-b-0">
        {navItems.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 rounded-3xl px-4 py-3 text-center text-sm font-semibold",
                active ? "bg-accent text-ink" : "bg-sand text-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
