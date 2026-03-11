import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { getDefaultDraft } from "@/components/BookForm";
import { AppButton } from "@/components/AppButton";
import { colors } from "@/constants/theme";
import { findBookByIsbn, incrementQuantity } from "@/db/database";
import { useInventory } from "@/hooks/useInventory";
import { normalizeIsbn } from "@/lib/isbn";
import { fetchBookMetadata } from "@/lib/metadata";
import { BookDraft } from "@/types/book";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);
  const { refresh, setPendingDraft } = useInventory();

  async function handleDuplicate(existingId: number, existingDraft: BookDraft) {
    Alert.alert("Book already scanned", "This ISBN is already in local inventory.", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          lockRef.current = false;
        },
      },
      {
        text: "Add Another Copy",
        onPress: () => {
          setPendingDraft({
            ...existingDraft,
            quantity: 1,
            scanned_at: new Date().toISOString(),
          });
          lockRef.current = false;
          router.push("/confirm");
        },
      },
      {
        text: "Increment Quantity",
        onPress: async () => {
          await incrementQuantity(existingId);
          refresh();
          lockRef.current = false;
          Alert.alert("Quantity updated", "Existing record quantity increased by one.");
          router.replace(`/book/${existingId}`);
        },
      },
    ]);
  }

  async function handleBarcode(data: string) {
    if (lockRef.current || busy) {
      return;
    }

    lockRef.current = true;
    setBusy(true);

    try {
      const normalized = normalizeIsbn(data);
      if (!normalized) {
        Alert.alert("Invalid barcode", "Scan a valid ISBN-10 or ISBN-13 barcode.");
        lockRef.current = false;
        return;
      }

      const existing = await findBookByIsbn(normalized.isbn10, normalized.isbn13);
      if (existing) {
        await handleDuplicate(existing.id, getDefaultDraft(existing));
        return;
      }

      const metadata = await fetchBookMetadata(normalized.isbn13 ?? normalized.raw, normalized.isbn10);
      setPendingDraft(
        getDefaultDraft({
          isbn_10: normalized.isbn10,
          isbn_13: normalized.isbn13,
          title: metadata?.title ?? "",
          authors: metadata?.authors ?? "",
          publisher: metadata?.publisher ?? "",
          published_date: metadata?.published_date ?? "",
          categories: metadata?.categories ?? "",
          thumbnail_url: metadata?.thumbnail_url ?? "",
          audience_band: metadata?.audience_band ?? "Unknown",
          is_ar_likely: metadata?.is_ar_likely ?? false,
          intake_batch: new Date().toISOString().slice(0, 10),
          storage_location: "Processing",
        }),
      );
      lockRef.current = false;
      router.push("/confirm");
    } catch (error) {
      Alert.alert("Scan failed", error instanceof Error ? error.message : "Unable to process this ISBN.");
      lockRef.current = false;
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera access is required</Text>
        <Text style={styles.copy}>Allow camera access to scan ISBN barcodes directly from the phone.</Text>
        <AppButton label="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.cameraWrap}>
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "code128", "upc_a"],
          }}
          onBarcodeScanned={busy ? undefined : ({ data }) => void handleBarcode(data)}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.overlayText}>Center the ISBN barcode in the frame.</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.helper}>Large scan zone, one-tap duplicate handling, local save only.</Text>
        <AppButton
          label="Ready for Next Scan"
          onPress={() => {
            lockRef.current = false;
          }}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  cameraWrap: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 18,
  },
  scanBox: {
    width: "92%",
    height: 160,
    borderWidth: 4,
    borderColor: colors.surface,
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  overlayText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  bottom: {
    gap: 12,
  },
  helper: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 24,
    textAlign: "center",
  },
  copy: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 16,
  },
});

