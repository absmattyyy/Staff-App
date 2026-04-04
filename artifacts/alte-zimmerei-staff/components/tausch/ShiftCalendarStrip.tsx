import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Shift } from "@/types";

interface ShiftCalendarStripProps {
  shifts: Shift[];
  onShiftPress: (shift: Shift) => void;
  alreadyRequestedShiftIds: Set<string>;
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatShiftDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: d.getDate(),
    weekday: WEEKDAYS[d.getDay()],
  };
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#30D158",
  changed: "#FFD60A",
  open: "#636366",
  cancelled: "#FF453A",
};

export function ShiftCalendarStrip({
  shifts,
  onShiftPress,
  alreadyRequestedShiftIds,
}: ShiftCalendarStripProps) {
  const colors = useColors();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = shifts
    .filter((s) => {
      const d = new Date(s.date + "T00:00:00");
      return d >= today && s.status !== "cancelled";
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) {
    return (
      <View
        style={[
          styles.emptyStrip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 12,
          },
        ]}
      >
        <Feather name="calendar" size={16} color={colors.mutedForeground} />
        <Text
          style={[
            styles.emptyText,
            {
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            },
          ]}
        >
          Keine bevorstehenden Schichten
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stripContent}
      style={styles.strip}
    >
      {upcoming.map((shift) => {
        const { day, weekday } = formatShiftDate(shift.date);
        const dotColor = STATUS_COLORS[shift.status] ?? colors.primary;
        const alreadyRequested = alreadyRequestedShiftIds.has(shift.id);

        return (
          <TouchableOpacity
            key={shift.id}
            onPress={() => !alreadyRequested && onShiftPress(shift)}
            activeOpacity={alreadyRequested ? 1 : 0.75}
            style={[
              styles.shiftChip,
              {
                backgroundColor: alreadyRequested
                  ? colors.muted
                  : colors.card,
                borderColor: alreadyRequested
                  ? colors.border
                  : colors.primary + "55",
                borderRadius: 12,
                opacity: alreadyRequested ? 0.6 : 1,
              },
            ]}
          >
            <View style={styles.dateCol}>
              <Text
                style={[
                  styles.weekday,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {weekday}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                {day}
              </Text>
            </View>
            <View style={styles.shiftMeta}>
              <View style={styles.dotRow}>
                <View
                  style={[styles.statusDot, { backgroundColor: dotColor }]}
                />
                <Text
                  style={[
                    styles.eventName,
                    {
                      color: colors.foreground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {shift.eventName}
                </Text>
              </View>
              <Text
                style={[
                  styles.shiftTime,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {shift.startTime} – {shift.endTime}
              </Text>
              {alreadyRequested && (
                <Text
                  style={[
                    styles.requestedBadge,
                    { color: colors.primary, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  Anfrage gestellt
                </Text>
              )}
            </View>
            {!alreadyRequested && (
              <Feather name="repeat" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: -16,
  },
  stripContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  shiftChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    gap: 10,
    minWidth: 180,
    maxWidth: 220,
  },
  dateCol: {
    alignItems: "center",
    minWidth: 30,
  },
  weekday: {
    fontSize: 11,
  },
  dayNum: {
    fontSize: 20,
  },
  shiftMeta: {
    flex: 1,
    gap: 3,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventName: {
    fontSize: 13,
    flex: 1,
  },
  shiftTime: {
    fontSize: 11,
  },
  requestedBadge: {
    fontSize: 11,
  },
  emptyStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
  },
});
