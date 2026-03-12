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
        "rounded-lg px-4 py-3 text-sm font-medium",
        tone === "info" && "bg-primary/5 text-charcoal",
        tone === "success" && "bg-emerald-50 text-emerald-800",
        tone === "warning" && "bg-amber-50 text-amber-800",
        tone === "error" && "bg-red-50 text-red-700",
      )}
    >
      {children}
    </div>
  );
}
