"use client";

import { FormEvent, useState } from "react";

import { Icon } from "@/components/ui/icon";

export function ManualEntry({
  disabled,
  onSubmitIsbn,
}: {
  disabled?: boolean;
  onSubmitIsbn: (isbn: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmitIsbn(value);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
      <label className="text-sm font-semibold text-charcoal">Enter ISBN manually</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="9780142403877"
          autoCapitalize="off"
          autoCorrect="off"
          inputMode="text"
          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-charcoal placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          disabled={disabled || !value.trim()}
          type="submit"
          className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Icon name="send" size="text-base" />
          Go
        </button>
      </div>
    </form>
  );
}
