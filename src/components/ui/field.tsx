import {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-charcoal">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 rounded-lg border border-slate-200 bg-white px-4 text-base text-charcoal outline-none ring-0 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30",
        props.className,
      )}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 rounded-lg border border-slate-200 bg-white px-4 text-base text-charcoal outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/30",
        props.className,
      )}
    />
  );
}

export function TextArea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-charcoal outline-none ring-0 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30",
        props.className,
      )}
    />
  );
}
