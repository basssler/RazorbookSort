"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldShell, TextArea, TextInput } from "@/components/ui/field";

export function CreateBatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
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
        location: String(formData.get("location") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to create batch.");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("batchId", payload.batch.id);
    setName("");
    setLocation("");
    setNotes("");
    router.replace(`/?${params.toString()}`);
    router.refresh();
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
      <FieldShell label="Location">
        <TextInput
          name="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="South warehouse"
        />
      </FieldShell>
      <FieldShell label="Notes">
        <TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional volunteer note" />
      </FieldShell>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <Button disabled={saving} type="submit">
        {saving ? "Creating..." : "Create Batch"}
      </Button>
    </form>
  );
}
