import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ShiftStatus, SwapStatus } from "@/types";

type BadgeVariant = ShiftStatus | SwapStatus | "important" | "pinned" | "news";

interface StatusBadgeProps {
  variant: BadgeVariant;
  size?: "sm" | "md";
}

const LABELS: Record<BadgeVariant, string> = {
  confirmed: "Bestätigt",
  changed: "Geändert",
  open: "Offen",
  cancelled: "Entfällt",
  pending: "Ausstehend",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
  important: "Wichtig",
  pinned: "Gepinnt",
  news: "News",
};

export function StatusBadge({ variant, size = "md" }: StatusBadgeProps) {
  const colors = useColors();

  const getColors = () => {
    switch (variant) {
      case "confirmed":
      case "approved":
        return { bg: colors.success + "22", text: colors.success };
      case "changed":
      case "pending":
        return { bg: colors.primary + "22", text: colors.primary };
      case "open":
        return { bg: colors.muted, text: colors.mutedForeground };
      case "cancelled":
      case "rejected":
        return { bg: colors.destructive + "22", text: colors.destructive };
      case "important":
        return { bg: colors.destructive + "22", text: colors.destructive };
      case "pinned":
        return { bg: colors.primary + "22", text: colors.primary };
      case "news":
        return { bg: colors.info + "22", text: colors.info };
      default:
        return { bg: colors.muted, text: colors.mutedForeground };
    }
  };

  const { bg, text } = getColors();
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderRadius: 999 },
        isSmall ? styles.badgeSm : styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          isSmall ? styles.textSm : styles.textMd,
        ]}
      >
        {LABELS[variant] ?? variant}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
  },
  textMd: {
    fontSize: 12,
  },
  textSm: {
    fontSize: 11,
  },
});
