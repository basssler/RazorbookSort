"use client";

import type { Route } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/scan", label: "Scanner", icon: "barcode_scanner", isCenter: true },
  { href: "/", label: "Batches", icon: "folder_copy" },
  { href: "/", label: "Settings", icon: "settings" },
];

export function BottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/10 bg-bg-light px-2 pb-safe pt-2">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const active =
            currentPath === item.href ||
            (item.href === "/scan" && currentPath.startsWith("/scan")) ||
            (item.href === "/inventory" &&
              currentPath.startsWith("/inventory"));

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href as Route}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center justify-center"
              >
                {/* Elevated scanner FAB */}
                <div
                  className={cn(
                    "absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95",
                    active
                      ? "bg-primary text-white"
                      : "bg-primary/90 text-white",
                  )}
                >
                  <Icon name={item.icon} size="text-[28px]" />
                </div>
                <span
                  className={cn(
                    "mt-8 text-[10px] font-bold uppercase tracking-wider",
                    active ? "text-primary" : "text-slate-400",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href as Route}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-1",
                active
                  ? "text-primary"
                  : "text-slate-400 hover:text-primary/60",
              )}
            >
              <Icon
                name={item.icon}
                size="text-2xl"
                filled={active}
              />
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  active ? "font-bold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
