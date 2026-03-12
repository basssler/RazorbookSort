import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChipProps = {
  children: ReactNode;
  variant?: "primary" | "muted";
  className?: string;
};

/**
 * Small pill badge for inline metadata (e.g. "42 COPIES SCANNED", quantity).
 */
export function Chip({
  children,
  variant = "primary",
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        variant === "primary" && "bg-primary/10 text-primary",
        variant === "muted" && "bg-slate-100 text-slate-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
