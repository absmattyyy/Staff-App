import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { SwapRequest } from "@/types";

interface SwapCardProps {
  swap: SwapRequest;
  onTakeOver?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SwapCard({ swap, onTakeOver }: SwapCardProps) {
  const colors = useColors();

  const handleTakeOver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTakeOver?.(swap.id);
  };

  const isActive = swap.status === "open" || swap.status === "pending";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor:
            swap.status === "approved"
              ? colors.success + "44"
              : swap.status === "rejected"
              ? colors.destructive + "33"
              : colors.border,
          borderRadius: 12,
          opacity: swap.status === "rejected" ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Avatar name={swap.requestedBy.name} size={36} />
        <View style={styles.headerInfo}>
          <Text
            style={[
              styles.name,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {swap.requestedBy.name}
          </Text>
          <Text
            style={[
              styles.meta,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {new Date(swap.createdAt).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
        <StatusBadge variant={swap.status} size="sm" />
      </View>

      <View
        style={[
          styles.shiftInfo,
          {
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.shiftRow}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text
            style={[
              styles.shiftText,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {formatDate(swap.shift.date)}
          </Text>
        </View>
        <View style={styles.shiftRow}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.shiftText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {swap.shift.startTime} – {swap.shift.endTime}
          </Text>
        </View>
        <View style={styles.shiftRow}>
          <Feather name="briefcase" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.shiftText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
            numberOfLines={1}
          >
            {swap.shift.eventName} · {swap.shift.location}
          </Text>
        </View>
      </View>

      {swap.note && (
        <Text
          style={[
            styles.note,
            {
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              backgroundColor: colors.muted,
              borderRadius: 8,
            },
          ]}
        >
          {swap.note}
        </Text>
      )}

      {!swap.isOwn && isActive && onTakeOver && (
        <PrimaryButton
          label="Schicht übernehmen"
          onPress={handleTakeOver}
          size="sm"
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
  },
  shiftInfo: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftText: {
    fontSize: 13,
    flex: 1,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
  },
});
