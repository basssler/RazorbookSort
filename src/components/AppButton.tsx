import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/theme";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = "primary", disabled = false }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "ghost" ? styles.ghostLabel : styles.filledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
  },
  filledLabel: {
    color: colors.ink,
  },
  ghostLabel: {
    color: colors.muted,
  },
});

