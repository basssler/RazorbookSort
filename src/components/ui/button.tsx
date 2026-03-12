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
        "min-h-14 rounded-xl border px-5 text-base font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        fullWidth && "w-full",
        variant === "primary" &&
          "border-primary bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110",
        variant === "secondary" &&
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        variant === "ghost" &&
          "border-slate-200 bg-white text-charcoal hover:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
