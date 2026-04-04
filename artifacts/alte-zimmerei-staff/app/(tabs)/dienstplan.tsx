import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { ShiftCard } from "@/components/dienstplan/ShiftCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventDetailModal } from "@/components/dienstplan/EventDetailModal";
import { CreateEventModal } from "@/components/dienstplan/CreateEventModal";
import { UnavailabilityModal } from "@/components/dienstplan/UnavailabilityModal";
import { useDienstplan } from "@/context/DienstplanContext";
import { useAppContext } from "@/context/AppContext";
import type { Event } from "@/types";

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
  const { user } = useAppContext();
  const {
    shifts,
    events,
    changedShifts,
    dismissShiftChange,
    myUnavailabilityDates,
  } = useDienstplan();

  const [activeTab, setActiveTab] = useState<PlanTab>("mine");
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showUnavailability, setShowUnavailability] = useState(false);

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const selectedDate = `2026-04-${String(selectedDay).padStart(2, "0")}`;

  const allShifts =
    activeTab === "mine" ? shifts.filter((s) => s.isOwn) : shifts;

  const dayShifts = allShifts.filter((s) => s.date === selectedDate);
  const upcomingShifts = allShifts
    .filter((s) => s.date > selectedDate)
    .slice(0, 6);

  const daysWithShifts = new Set(allShifts.map((s) => Number(s.date.split("-")[2])));

  const isUnavailableDay = myUnavailabilityDates.has(selectedDate);

  const handleShiftPress = (eventId?: string) => {
    if (!eventId) return;
    const event = events.find((e) => e.id === eventId);
    if (event) setSelectedEvent(event);
  };

  const handleShiftPressCompact = (eventName: string) => {
    const event = events.find((e) => e.name === eventName);
    if (event) setSelectedEvent(event);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
        >
          Dienstplan
        </Text>
        <View style={styles.headerRight}>
          <Text
            style={[styles.monthLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
          >
            April 2026
          </Text>
          {user.isAdmin ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCreateEvent(true);
              }}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={[styles.addBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                Event
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowUnavailability(true);
              }}
              style={[styles.unavailBtn, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "50" }]}
            >
              <Feather name="slash" size={14} color={colors.destructive} />
              <Text style={[styles.unavailBtnText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
                Nicht verfügbar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Changed shifts banner */}
      {changedShifts.length > 0 && (
        <View style={[styles.changeBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
          <Feather name="bell" size={14} color={colors.primary} />
          <View style={styles.changeBannerText}>
            <Text style={[styles.changeBannerTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {changedShifts.length === 1
                ? "1 Schichtänderung"
                : `${changedShifts.length} Schichtänderungen`}
            </Text>
            <Text style={[styles.changeBannerSub, { color: colors.primary + "cc", fontFamily: "Inter_400Regular" }]}>
              {changedShifts.map((s) => s.eventName).join(", ")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => changedShifts.forEach((s) => dismissShiftChange(s.id))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Segment control */}
      <View
        style={[
          styles.segmentWrapper,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
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

      {/* Calendar strip */}
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
          const dayDate = `2026-04-${String(day).padStart(2, "0")}`;
          const isUnavail = myUnavailabilityDates.has(dayDate);
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
                    : isUnavail
                    ? colors.destructive + "18"
                    : "transparent",
                  borderRadius: 12,
                  borderWidth: isUnavail && !isSelected ? 1 : 0,
                  borderColor: colors.destructive + "40",
                },
              ]}
            >
              <Text
                style={[
                  styles.weekdayLabel,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : isUnavail
                      ? colors.destructive
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
                      : isUnavail
                      ? colors.destructive
                      : isToday
                      ? colors.primary
                      : colors.foreground,
                    fontFamily:
                      isSelected || isToday ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
              >
                {day}
              </Text>
              {hasShift && !isSelected && !isUnavail && (
                <View style={[styles.shiftDot, { backgroundColor: colors.primary }]} />
              )}
              {isUnavail && !isSelected && (
                <View style={[styles.shiftDot, { backgroundColor: colors.destructive }]} />
              )}
              {!hasShift && !isUnavail && <View style={styles.shiftDotPlaceholder} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Unavailability indicator */}
        {isUnavailableDay && (
          <View style={[styles.unavailDay, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}>
            <Feather name="slash" size={14} color={colors.destructive} />
            <Text style={[styles.unavailDayText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
              Als nicht verfügbar eingetragen
            </Text>
            <TouchableOpacity onPress={() => setShowUnavailability(true)}>
              <Text style={[styles.unavailDayLink, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                Bearbeiten
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title={`${getDayInfo(selectedDay).weekday}, ${selectedDay}. April`}
          style={styles.sectionHeader}
        />

        {dayShifts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderRadius: 12 }]}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Keine Schichten an diesem Tag
            </Text>
            {user.isAdmin && (
              <TouchableOpacity
                onPress={() => setShowCreateEvent(true)}
                style={[styles.createFromEmptyBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }]}
              >
                <Feather name="plus" size={13} color={colors.primary} />
                <Text style={[styles.createFromEmptyText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  Event erstellen
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          dayShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onPress={() => handleShiftPress(shift.eventId)}
            />
          ))
        )}

        {upcomingShifts.length > 0 && (
          <>
            <SectionHeader
              title="Kommende Schichten"
              style={[styles.sectionHeader, { marginTop: 20 }]}
            />
            {upcomingShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                compact
                onPress={() => handleShiftPressCompact(shift.eventName)}
              />
            ))}
          </>
        )}

        {/* Admin: Unavailability overview */}
        {user.isAdmin && (
          <TouchableOpacity
            onPress={() => setShowUnavailability(true)}
            activeOpacity={0.7}
            style={[styles.unavailAdminBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="slash" size={14} color={colors.mutedForeground} />
            <Text style={[styles.unavailAdminText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Nicht-Verfügbarkeiten der Mitarbeiter anzeigen
            </Text>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <CreateEventModal
        visible={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
      />
      <UnavailabilityModal
        visible={showUnavailability}
        onClose={() => setShowUnavailability(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 28 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  monthLabel: { fontSize: 14 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: { color: "#fff", fontSize: 13 },
  unavailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unavailBtnText: { fontSize: 12 },
  changeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  changeBannerText: { flex: 1, gap: 2 },
  changeBannerTitle: { fontSize: 13 },
  changeBannerSub: { fontSize: 12 },
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
  weekdayLabel: { fontSize: 10 },
  dayNumber: { fontSize: 16 },
  shiftDot: { width: 5, height: 5, borderRadius: 2.5 },
  shiftDotPlaceholder: { width: 5, height: 5 },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  sectionHeader: { marginBottom: 12 },
  unavailDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  unavailDayText: { flex: 1, fontSize: 13 },
  unavailDayLink: { fontSize: 13, textDecorationLine: "underline" },
  emptyState: {
    alignItems: "center",
    gap: 8,
    padding: 28,
  },
  emptyText: { fontSize: 14 },
  createFromEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 4,
  },
  createFromEmptyText: { fontSize: 13 },
  unavailAdminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  unavailAdminText: { flex: 1, fontSize: 13 },
});
