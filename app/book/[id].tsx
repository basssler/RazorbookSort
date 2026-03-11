import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { BookForm, bookRecordToDraft } from "@/components/BookForm";
import { colors } from "@/constants/theme";
import { getBookById, updateBook } from "@/db/database";
import { useInventory } from "@/hooks/useInventory";
import { formatDate } from "@/lib/format";
import { BookDraft, BookRecord } from "@/types/book";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function BookDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const { refresh } = useInventory();
  const [book, setBook] = useState<BookRecord | null>(null);
  const [editing, setEditing] = useState(false);

  const loadBook = useCallback(async () => {
    if (!Number.isFinite(id)) {
      return;
    }
    setBook(await getBookById(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadBook();
    }, [loadBook]),
  );

  async function handleSave(nextValue: BookDraft) {
    try {
      const updated = await updateBook(id, nextValue);
      setBook(updated);
      setEditing(false);
      refresh();
    } catch (error) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Unable to update this book.");
    }
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (editing) {
    return <BookForm initialValue={bookRecordToDraft(book)} submitLabel="Save Changes" onSubmit={handleSave} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.thumbnail_url ? <Image source={{ uri: book.thumbnail_url }} style={styles.image} /> : null}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.authors}>{book.authors || "Unknown author"}</Text>

      <View style={styles.grid}>
        <Info label="ISBN-13" value={book.isbn_13 || "None"} />
        <Info label="ISBN-10" value={book.isbn_10 || "None"} />
        <Info label="Publisher" value={book.publisher || "Unknown"} />
        <Info label="Published" value={book.published_date || "Unknown"} />
        <Info label="Categories" value={book.categories || "None"} />
        <Info label="Condition" value={book.condition} />
        <Info label="Audience" value={book.audience_band} />
        <Info label="AR Likely" value={book.is_ar_likely ? "Yes" : "No"} />
        <Info label="Quantity" value={String(book.quantity)} />
        <Info label="Batch" value={book.intake_batch || "None"} />
        <Info label="Storage" value={book.storage_location || "None"} />
        <Info label="Status" value={book.status} />
        <Info label="Scanned" value={formatDate(book.scanned_at)} />
        <Info label="Notes" value={book.notes || "None"} />
      </View>

      <AppButton label="Edit Book" onPress={() => setEditing(true)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 18,
    gap: 16,
    paddingBottom: 40,
  },
  image: {
    width: 120,
    height: 176,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: colors.surfaceAlt,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: colors.ink,
    textAlign: "center",
  },
  authors: {
    fontSize: 17,
    color: colors.muted,
    textAlign: "center",
  },
  grid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  infoLabel: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 14,
  },
  infoValue: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 17,
  },
});
