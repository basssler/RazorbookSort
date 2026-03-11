"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextInput } from "@/components/ui/field";
import { Batch } from "@/lib/app-types";

export function CreateBatchForm({
  onCreated,
}: {
  onCreated: (batch: Batch) => void;
}) {
  const [name, setName] = useState("");
  const [sourceLocation, setSourceLocation] = useState("");
  const [status, setStatus] = useState("open");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        sourceLocation: String(formData.get("sourceLocation") ?? ""),
        status: String(formData.get("status") ?? "open"),
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to create batch.");
      return;
    }

    setName("");
    setSourceLocation("");
    setStatus("open");
    onCreated(payload.batch as Batch);
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <FieldShell label="New Batch Name">
        <TextInput
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Friday donation drive"
        />
      </FieldShell>
      <FieldShell label="Source location">
        <TextInput
          name="sourceLocation"
          value={sourceLocation}
          onChange={(event) => setSourceLocation(event.target.value)}
          placeholder="South warehouse"
        />
      </FieldShell>
      <FieldShell label="Status">
        <TextInput name="status" value={status} onChange={(event) => setStatus(event.target.value)} placeholder="open" />
      </FieldShell>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <Button disabled={saving} type="submit">
        {saving ? "Creating..." : "Create Batch"}
      </Button>
    </form>
  );
}
