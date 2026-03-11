import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { BookCard } from "@/components/BookCard";
import { colors } from "@/constants/theme";
import { listBooks } from "@/db/database";
import { useInventory } from "@/hooks/useInventory";
import { BookRecord } from "@/types/book";

export default function InventoryScreen() {
  const { exportCsv, refreshKey } = useInventory();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<BookRecord[]>([]);

  const loadBooks = useCallback(async () => {
    const items = await listBooks(search);
    setBooks(items);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      void loadBooks();
    }, [loadBooks, refreshKey]),
  );

  async function handleExport() {
    try {
      const { fileUri } = await exportCsv();
      Alert.alert("CSV ready", `Inventory export saved to:\n${fileUri}`);
    } catch (error) {
      Alert.alert("Export failed", error instanceof Error ? error.message : "Unable to export CSV.");
    }
  }

  return (
    <View style={styles.screen}>
      <TextInput
        onChangeText={setSearch}
        onSubmitEditing={() => void loadBooks()}
        placeholder="Search title, author, or ISBN"
        placeholderTextColor={colors.muted}
        style={styles.search}
        value={search}
      />

      <View style={styles.row}>
        <AppButton label="Refresh" onPress={() => void loadBooks()} variant="secondary" />
        <AppButton label="Export CSV" onPress={handleExport} variant="ghost" />
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={books}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => router.push(`/book/${item.id}`)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No books found for this search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  search: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  list: {
    paddingVertical: 8,
    gap: 12,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 16,
    marginTop: 40,
  },
});

