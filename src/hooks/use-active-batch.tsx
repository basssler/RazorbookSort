"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type ActiveBatchState = {
  id: string;
  name: string;
};

type ActiveBatchContextValue = {
  activeBatch: ActiveBatchState | null;
  hasHydrated: boolean;
  setActiveBatch: (batch: ActiveBatchState) => void;
  clearActiveBatch: () => void;
};

const STORAGE_KEY = "activeBatch";

const ActiveBatchContext = createContext<ActiveBatchContextValue | null>(null);

export function ActiveBatchProvider({ children }: { children: ReactNode }) {
  const [activeBatch, setActiveBatchState] = useState<ActiveBatchState | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      try {
        setActiveBatchState(JSON.parse(storedValue) as ActiveBatchState);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasHydrated(true);
  }, []);

  const value = useMemo<ActiveBatchContextValue>(
    () => ({
      activeBatch,
      hasHydrated,
      setActiveBatch(batch) {
        setActiveBatchState(batch);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batch));
        }
      },
      clearActiveBatch() {
        setActiveBatchState(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      },
    }),
    [activeBatch, hasHydrated],
  );

  return <ActiveBatchContext.Provider value={value}>{children}</ActiveBatchContext.Provider>;
}

export function useActiveBatch() {
  const context = useContext(ActiveBatchContext);

  if (!context) {
    throw new Error("useActiveBatch must be used within ActiveBatchProvider.");
  }

  return context;
}
