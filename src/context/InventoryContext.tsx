import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { exportBooksCsv, getStats, initDatabase, seedIfEmpty } from "@/db/database";
import { BookDraft } from "@/types/book";

type InventoryContextValue = {
  isReady: boolean;
  refreshKey: number;
  pendingDraft: BookDraft | null;
  setPendingDraft: (draft: BookDraft | null) => void;
  refresh: () => void;
  exportCsv: () => Promise<{ fileUri: string }>;
  stats: {
    totalTitles: number;
    totalCopies: number;
    latestScan: string | null;
  };
};

export const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDraft, setPendingDraft] = useState<BookDraft | null>(null);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCopies: 0,
    latestScan: null as string | null,
  });

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      await initDatabase();
      await seedIfEmpty();
      setStats(await getStats());
      setIsReady(true);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void getStats().then(setStats);
  }, [isReady, refreshKey]);

  const exportCsv = useCallback(async () => {
    const csv = await exportBooksCsv();
    const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (!directory) {
      throw new Error("No writable directory is available for export.");
    }

    const fileUri = `${directory}razorbook-reach-intake-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Export inventory CSV",
        mimeType: "text/csv",
      });
    }

    return { fileUri };
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      refreshKey,
      pendingDraft,
      setPendingDraft,
      refresh,
      exportCsv,
      stats,
    }),
    [exportCsv, isReady, pendingDraft, refresh, refreshKey, stats],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

