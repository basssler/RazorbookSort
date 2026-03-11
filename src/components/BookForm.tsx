import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/AppButton";
import { colors } from "@/constants/theme";
import {
  AUDIENCE_OPTIONS,
  BookDraft,
  BookRecord,
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
} from "@/types/book";

type BookFormProps = {
  initialValue: BookDraft;
  submitLabel: string;
  onSubmit: (value: BookDraft) => Promise<void>;
};

function SelectChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={styles.chipText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

function normalizeDraft(draft: BookDraft): BookDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    authors: draft.authors.trim(),
    publisher: draft.publisher.trim(),
    published_date: draft.published_date.trim(),
    categories: draft.categories.trim(),
    thumbnail_url: draft.thumbnail_url.trim(),
    intake_batch: draft.intake_batch.trim(),
    storage_location: draft.storage_location.trim(),
    notes: draft.notes.trim(),
    quantity: Math.max(1, Number(draft.quantity) || 1),
  };
}

export function getDefaultDraft(partial?: Partial<BookDraft>): BookDraft {
  return {
    isbn_10: partial?.isbn_10 ?? "",
    isbn_13: partial?.isbn_13 ?? "",
    title: partial?.title ?? "",
    authors: partial?.authors ?? "",
    publisher: partial?.publisher ?? "",
    published_date: partial?.published_date ?? "",
    categories: partial?.categories ?? "",
    thumbnail_url: partial?.thumbnail_url ?? "",
    condition: partial?.condition ?? "Good",
    audience_band: partial?.audience_band ?? "Unknown",
    is_ar_likely: partial?.is_ar_likely ?? false,
    quantity: partial?.quantity ?? 1,
    intake_batch: partial?.intake_batch ?? "",
    storage_location: partial?.storage_location ?? "",
    notes: partial?.notes ?? "",
    status: partial?.status ?? "New Intake",
    scanned_at: partial?.scanned_at ?? new Date().toISOString(),
  };
}

export function bookRecordToDraft(record: BookRecord): BookDraft {
  return {
    isbn_10: record.isbn_10,
    isbn_13: record.isbn_13,
    title: record.title,
    authors: record.authors,
    publisher: record.publisher,
    published_date: record.published_date,
    categories: record.categories,
    thumbnail_url: record.thumbnail_url,
    condition: record.condition,
    audience_band: record.audience_band,
    is_ar_likely: record.is_ar_likely,
    quantity: record.quantity,
    intake_batch: record.intake_batch,
    storage_location: record.storage_location,
    notes: record.notes,
    status: record.status,
    scanned_at: record.scanned_at,
  };
}

export function BookForm({ initialValue, submitLabel, onSubmit }: BookFormProps) {
  const [draft, setDraft] = useState<BookDraft>(initialValue);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof BookDraft>(key: K, value: BookDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSubmit(normalizeDraft(draft));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {draft.thumbnail_url ? <Image source={{ uri: draft.thumbnail_url }} style={styles.image} /> : null}

      <Field label="Title" value={draft.title} onChangeText={(value) => update("title", value)} />
      <Field label="Authors" value={draft.authors} onChangeText={(value) => update("authors", value)} />
      <Field label="ISBN-13" value={draft.isbn_13 ?? ""} onChangeText={(value) => update("isbn_13", value)} />
      <Field label="ISBN-10" value={draft.isbn_10 ?? ""} onChangeText={(value) => update("isbn_10", value)} />
      <Field label="Publisher" value={draft.publisher} onChangeText={(value) => update("publisher", value)} />
      <Field
        label="Published Date"
        value={draft.published_date}
        onChangeText={(value) => update("published_date", value)}
      />
      <Field label="Categories" value={draft.categories} onChangeText={(value) => update("categories", value)} />
      <Field
        label="Thumbnail URL"
        value={draft.thumbnail_url}
        onChangeText={(value) => update("thumbnail_url", value)}
      />
      <Field
        label="Quantity"
        value={String(draft.quantity)}
        onChangeText={(value) => update("quantity", Number(value) || 1)}
        keyboardType="numeric"
      />
      <Field
        label="Intake Batch"
        value={draft.intake_batch}
        onChangeText={(value) => update("intake_batch", value)}
      />
      <Field
        label="Storage Location"
        value={draft.storage_location}
        onChangeText={(value) => update("storage_location", value)}
      />

      <SelectChips
        label="Condition"
        value={draft.condition}
        options={CONDITION_OPTIONS}
        onChange={(value) => update("condition", value)}
      />
      <SelectChips
        label="Audience"
        value={draft.audience_band}
        options={AUDIENCE_OPTIONS}
        onChange={(value) => update("audience_band", value)}
      />
      <SelectChips
        label="Status"
        value={draft.status}
        options={STATUS_OPTIONS}
        onChange={(value) => update("status", value)}
      />

      <View style={styles.switchRow}>
        <Text style={styles.fieldLabel}>AR likely</Text>
        <Switch value={draft.is_ar_likely} onValueChange={(value) => update("is_ar_likely", value)} />
      </View>

      <Field label="Notes" value={draft.notes} onChangeText={(value) => update("notes", value)} multiline />

      <AppButton disabled={saving} label={saving ? "Saving..." : submitLabel} onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
    paddingBottom: 48,
  },
  image: {
    width: 100,
    height: 145,
    borderRadius: 14,
    alignSelf: "center",
    backgroundColor: colors.surfaceAlt,
  },
  block: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
  },
  chipSelected: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.ink,
    fontWeight: "700",
  },
  switchRow: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
