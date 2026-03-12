import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatusBanner({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-medium",
        tone === "info" && "bg-stone-100 text-stone-700",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-amber-100 text-amber-800",
        tone === "error" && "bg-red-100 text-red-700",
      )}
    >
      {children}
    </div>
  );
}
