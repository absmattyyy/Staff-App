import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Shift } from "@/types";

interface ShiftCardProps {
  shift: Shift;
  onPress?: () => void;
  compact?: boolean;
}

const WEEKDAYS_SHORT: Record<string, string> = {
  "0": "So",
  "1": "Mo",
  "2": "Di",
  "3": "Mi",
  "4": "Do",
  "5": "Fr",
  "6": "Sa",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDate();
  const month = date.toLocaleDateString("de-DE", { month: "short" });
  const weekday = WEEKDAYS_SHORT[date.getDay().toString()] ?? "";
  return `${weekday}, ${day}. ${month}`;
}

export function ShiftCard({ shift, onPress, compact = false }: ShiftCardProps) {
  const colors = useColors();

  const isOwn = shift.isOwn;
  const isChanged = shift.status === "changed";
  const isCancelled = shift.status === "cancelled";

  const borderColor = isChanged
    ? colors.primary + "66"
    : isCancelled
    ? colors.destructive + "44"
    : isOwn
    ? colors.border
    : colors.border;

  const bgColor = isOwn ? colors.card : colors.surface;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor,
          borderRadius: 12,
          opacity: isCancelled ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.leftBar}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor:
                shift.status === "confirmed"
                  ? colors.success
                  : shift.status === "changed"
                  ? colors.primary
                  : shift.status === "open"
                  ? colors.mutedForeground
                  : colors.destructive,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.eventName,
              {
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                flex: 1,
              },
            ]}
            numberOfLines={1}
          >
            {shift.eventName}
          </Text>
          <StatusBadge variant={shift.status} size="sm" />
        </View>

        <View style={styles.infoRow}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text
            style={[
              styles.infoText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {shift.startTime} – {shift.endTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text
            style={[
              styles.infoText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {shift.location}
          </Text>
        </View>

        {!compact && (
          <View style={styles.infoRow}>
            <Feather name="user" size={12} color={colors.mutedForeground} />
            <Text
              style={[
                styles.infoText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {shift.role}
            </Text>
          </View>
        )}

        {shift.notes && !compact && (
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: isChanged
                  ? colors.primary + "18"
                  : colors.muted,
                borderRadius: 6,
              },
            ]}
          >
            <Text
              style={[
                styles.notesText,
                {
                  color: isChanged ? colors.primary : colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {shift.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  leftBar: {
    width: 36,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingLeft: 4,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
  },
  notesBox: {
    marginTop: 6,
    padding: 8,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
