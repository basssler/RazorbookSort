import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  fullWidth = true,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "min-h-14 rounded-3xl border px-5 text-base font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200",
        fullWidth && "w-full",
        variant === "primary" && "border-accentDark bg-accent text-ink shadow-card",
        variant === "secondary" && "border-line bg-sand text-ink",
        variant === "ghost" && "border-line bg-card text-muted",
        className,
      )}
      {...props}
    />
  );
}
