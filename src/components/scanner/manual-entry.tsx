"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextInput } from "@/components/ui/field";

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
      <FieldShell label="Manual ISBN">
        <TextInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="9780142403877"
          autoCapitalize="off"
          autoCorrect="off"
          inputMode="text"
        />
      </FieldShell>
      <Button disabled={disabled || !value.trim()} type="submit">
        Continue With ISBN
      </Button>
    </form>
  );
}
