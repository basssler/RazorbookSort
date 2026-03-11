import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";
import { formatAuthors, formatDate } from "@/lib/format";
import { BookRecord } from "@/types/book";

type BookCardProps = {
  book: BookRecord;
  onPress: () => void;
};

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Text style={styles.title}>{book.title || "Untitled"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Qty {book.quantity}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{formatAuthors(book.authors)}</Text>
      <Text style={styles.meta}>{book.isbn_13 || book.isbn_10 || "No ISBN saved"}</Text>
      <Text style={styles.footer}>
        {book.status} • {book.storage_location || "No location"} • {formatDate(book.scanned_at)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    color: colors.ink,
  },
  badge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.ink,
    fontWeight: "700",
  },
  meta: {
    color: colors.muted,
    fontSize: 15,
  },
  footer: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
});

