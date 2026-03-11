import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { BookForm } from "@/components/BookForm";
import { colors } from "@/constants/theme";
import { insertBook } from "@/db/database";
import { useInventory } from "@/hooks/useInventory";
import { BookDraft } from "@/types/book";

export default function ConfirmScreen() {
  const { pendingDraft, refresh, setPendingDraft } = useInventory();

  if (!pendingDraft) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>No scanned book ready</Text>
        <Text style={styles.copy}>Scan an ISBN first, then confirm and save the intake record.</Text>
      </View>
    );
  }

  async function handleSave(value: BookDraft) {
    try {
      const saved = await insertBook({
        ...value,
        scanned_at: new Date().toISOString(),
      });
      refresh();
      setPendingDraft(null);
      if (saved) {
        router.replace(`/book/${saved.id}`);
      } else {
        router.replace("/inventory");
      }
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to save this book.");
    }
  }

  return <BookForm initialValue={pendingDraft} submitLabel="Save Book" onSubmit={handleSave} />;
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  copy: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 16,
  },
});
