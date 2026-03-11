import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { InventoryProvider } from "@/context/InventoryContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <InventoryProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surfaceAlt },
            headerTintColor: colors.ink,
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: "800",
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Reach Intake" }} />
          <Stack.Screen name="scanner" options={{ title: "Scan ISBN" }} />
          <Stack.Screen name="confirm" options={{ title: "Confirm Book" }} />
          <Stack.Screen name="inventory" options={{ title: "Inventory List" }} />
          <Stack.Screen name="book/[id]" options={{ title: "Book Detail" }} />
        </Stack>
      </InventoryProvider>
    </SafeAreaProvider>
  );
}

