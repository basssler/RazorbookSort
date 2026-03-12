"use client";

import type { Route } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/scan", label: "Scanner", icon: "barcode_scanner", isCenter: true },
  { href: "/", label: "Batches", icon: "history" },
  { href: "/", label: "Settings", icon: "settings" },
];

export function BottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/10 bg-bg-light px-4 pb-4 pt-2">
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
                className="flex flex-col items-center gap-1 text-primary"
              >
                <div
                  className={cn(
                    "-mt-4 mb-1 flex items-center justify-center rounded-full p-2 transition-transform active:scale-95",
                    "bg-primary/10",
                  )}
                >
                  <Icon name={item.icon} size="text-[32px]" />
                </div>
                <span className="-mt-1 text-[10px] font-bold uppercase tracking-wider">
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
                "flex flex-col items-center gap-1 py-1",
                active
                  ? "text-primary"
                  : "text-charcoal/40",
              )}
            >
              <Icon
                name={item.icon}
                size="text-[24px]"
                filled={active}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
