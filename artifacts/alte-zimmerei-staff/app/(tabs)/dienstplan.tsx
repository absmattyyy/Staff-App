import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { ShiftCard } from "@/components/dienstplan/ShiftCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockShifts } from "@/data/mockShifts";

type PlanTab = "mine" | "all";

const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function getDayInfo(day: number) {
  const date = new Date(2026, 3, day);
  return {
    day,
    weekday: WEEKDAYS[date.getDay()],
    isToday: day === 4,
    date: `2026-04-${String(day).padStart(2, "0")}`,
  };
}

export default function DienstplanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<PlanTab>("mine");
  const [selectedDay, setSelectedDay] = useState<number>(4);

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const selectedDate = `2026-04-${String(selectedDay).padStart(2, "0")}`;

  const allShifts =
    activeTab === "mine"
      ? mockShifts.filter((s) => s.isOwn)
      : mockShifts;

  const dayShifts = allShifts.filter((s) => s.date === selectedDate);
  const upcomingShifts = allShifts
    .filter((s) => s.date > selectedDate)
    .slice(0, 6);

  const daysWithShifts = new Set(
    allShifts.map((s) => Number(s.date.split("-")[2]))
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Dienstplan
        </Text>
        <View style={styles.headerRight}>
          <Text
            style={[
              styles.monthLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
            ]}
          >
            April 2026
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Feather name="download" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.segmentWrapper,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <SegmentControl
          options={[
            { label: "Mein Dienstplan", value: "mine" as PlanTab },
            { label: "Alle", value: "all" as PlanTab },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.calendarRow, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.calendarContent}
      >
        {MONTH_DAYS.map((day) => {
          const { weekday, isToday, date } = getDayInfo(day);
          const isSelected = day === selectedDay;
          const hasShift = daysWithShifts.has(day);
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.75}
              style={[
                styles.dayCell,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : "transparent",
                  borderRadius: 12,
                },
              ]}
            >
              <Text
                style={[
                  styles.weekdayLabel,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {weekday}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : isToday
                      ? colors.primary
                      : colors.foreground,
                    fontFamily: isSelected || isToday
                      ? "Inter_700Bold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                {day}
              </Text>
              {hasShift && !isSelected && (
                <View
                  style={[
                    styles.shiftDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              {!hasShift && <View style={styles.shiftDotPlaceholder} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={`${getDayInfo(selectedDay).weekday}, ${selectedDay}. April`}
          style={styles.sectionHeader}
        />

        {dayShifts.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.card, borderRadius: 12 },
            ]}
          >
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Keine Schichten an diesem Tag
            </Text>
          </View>
        ) : (
          dayShifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))
        )}

        {upcomingShifts.length > 0 && (
          <>
            <SectionHeader
              title="Kommende Schichten"
              style={[styles.sectionHeader, { marginTop: 20 }]}
            />
            {upcomingShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} compact />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 28,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  monthLabel: {
    fontSize: 14,
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  calendarRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
  },
  calendarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  dayCell: {
    width: 44,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 2,
  },
  weekdayLabel: {
    fontSize: 10,
  },
  dayNumber: {
    fontSize: 16,
  },
  shiftDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  shiftDotPlaceholder: {
    width: 5,
    height: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    padding: 28,
  },
  emptyText: {
    fontSize: 14,
  },
});
