import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/5 bg-white p-5 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
