import { useContext } from "react";

import { InventoryContext } from "@/context/InventoryContext";

export function useInventory() {
  const value = useContext(InventoryContext);
  if (!value) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return value;
}
