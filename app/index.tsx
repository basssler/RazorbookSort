import { router } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { colors } from "@/constants/theme";
import { useInventory } from "@/hooks/useInventory";
import { formatDate } from "@/lib/format";

export default function HomeScreen() {
  const { exportCsv, isReady, stats } = useInventory();

  async function handleExport() {
    try {
      const { fileUri } = await exportCsv();
      Alert.alert("CSV ready", `Inventory export saved to:\n${fileUri}`);
    } catch (error) {
      Alert.alert("Export failed", error instanceof Error ? error.message : "Unable to export inventory.");
    }
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>Preparing local inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.title}>Razorbook Reach Intake</Text>
        <Text style={styles.subtitle}>
          Fast ISBN scanning, local save, duplicate handling, and volunteer-friendly review.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalTitles}</Text>
          <Text style={styles.statLabel}>Titles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCopies}</Text>
          <Text style={styles.statLabel}>Copies</Text>
        </View>
      </View>

      <View style={styles.lastScan}>
        <Text style={styles.lastScanLabel}>Latest scan</Text>
        <Text style={styles.lastScanValue}>{stats.latestScan ? formatDate(stats.latestScan) : "No scans yet"}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Scan ISBN" onPress={() => router.push("/scanner")} />
        <AppButton label="Inventory List" onPress={() => router.push("/inventory")} variant="secondary" />
        <AppButton label="Export CSV" onPress={handleExport} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    gap: 20,
    justifyContent: "center",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16,
  },
  hero: {
    gap: 10,
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 24,
    padding: 20,
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "700",
  },
  lastScan: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  lastScanLabel: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 15,
  },
  lastScanValue: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 17,
  },
  actions: {
    gap: 14,
  },
});

