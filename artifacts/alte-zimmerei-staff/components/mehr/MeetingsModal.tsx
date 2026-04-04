import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { useDienstplan } from "@/context/DienstplanContext";

interface MeetingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getRelativeDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff === -1) return "Gestern";
  if (diff > 1 && diff < 7) return `In ${diff} Tagen`;
  return "";
}

export function MeetingsModal({ visible, onClose }: MeetingsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events } = useDienstplan();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isMeeting = (name: string) =>
    name.toLowerCase().includes("meeting") ||
    name.toLowerCase().includes("besprechung");

  const upcomingEvents = events
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d >= today && e.status !== "cancelled" && isMeeting(e.name);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastEvents = events
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d < today && isMeeting(e.name);
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top || 16,
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text
              style={[
                styles.closeText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Schließen
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Meetings & Events
          </Text>
          <View style={{ minWidth: 80 }} />
        </View>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Bevorstehend
          </Text>

          {upcomingEvents.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <Feather
                name="calendar"
                size={24}
                color={colors.mutedForeground}
              />
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                Keine bevorstehenden Events
              </Text>
            </View>
          ) : (
            upcomingEvents.map((event) => {
              const relDay = getRelativeDay(event.date);
              const isMyEvent = event.staff.some((s) => s.id === "u1");
              return (
                <View
                  key={event.id}
                  style={[
                    styles.eventCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isMyEvent
                        ? colors.primary + "44"
                        : colors.border,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.dateBadge}>
                      <Text
                        style={[
                          styles.dateBadgeDay,
                          {
                            color: colors.primary,
                            fontFamily: "Inter_700Bold",
                          },
                        ]}
                      >
                        {new Date(event.date + "T00:00:00").getDate()}
                      </Text>
                      <Text
                        style={[
                          styles.dateBadgeMonth,
                          {
                            color: colors.mutedForeground,
                            fontFamily: "Inter_400Regular",
                          },
                        ]}
                      >
                        {new Date(event.date + "T00:00:00").toLocaleDateString(
                          "de-DE",
                          { month: "short" }
                        )}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <View style={styles.eventTitleRow}>
                        <Text
                          style={[
                            styles.eventName,
                            {
                              color: colors.foreground,
                              fontFamily: "Inter_600SemiBold",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {event.name}
                        </Text>
                        {relDay ? (
                          <View
                            style={[
                              styles.relDayBadge,
                              {
                                backgroundColor:
                                  relDay === "Heute"
                                    ? colors.success + "20"
                                    : colors.primary + "15",
                                borderRadius: 6,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.relDayText,
                                {
                                  color:
                                    relDay === "Heute"
                                      ? colors.success
                                      : colors.primary,
                                  fontFamily: "Inter_500Medium",
                                },
                              ]}
                            >
                              {relDay}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.eventMeta}>
                        <Feather
                          name="clock"
                          size={12}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.eventMetaText,
                            {
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                        >
                          {event.startTime} – {event.endTime}
                        </Text>
                        {event.location && (
                          <>
                            <Text
                              style={{ color: colors.border }}
                            >
                              ·
                            </Text>
                            <Feather
                              name="map-pin"
                              size={12}
                              color={colors.mutedForeground}
                            />
                            <Text
                              style={[
                                styles.eventMetaText,
                                {
                                  color: colors.mutedForeground,
                                  fontFamily: "Inter_400Regular",
                                },
                              ]}
                            >
                              {event.location}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {event.description && (
                    <Text
                      style={[
                        styles.eventDesc,
                        {
                          color: colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                        },
                      ]}
                      numberOfLines={3}
                    >
                      {event.description}
                    </Text>
                  )}

                  {event.staff.length > 0 && (
                    <View style={styles.staffRow}>
                      <Feather
                        name="users"
                        size={12}
                        color={colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.staffText,
                          {
                            color: colors.mutedForeground,
                            fontFamily: "Inter_400Regular",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {event.staff.map((s) => s.name).join(", ")}
                      </Text>
                    </View>
                  )}

                  {isMyEvent && (
                    <View
                      style={[
                        styles.myEventBadge,
                        {
                          backgroundColor: colors.primary + "15",
                          borderRadius: 6,
                        },
                      ]}
                    >
                      <Feather name="user" size={11} color={colors.primary} />
                      <Text
                        style={[
                          styles.myEventText,
                          {
                            color: colors.primary,
                            fontFamily: "Inter_500Medium",
                          },
                        ]}
                      >
                        Du bist eingeteilt
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {pastEvents.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    marginTop: 24,
                  },
                ]}
              >
                Vergangene Events
              </Text>
              {pastEvents.map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.pastCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: 12,
                      opacity: 0.65,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pastName,
                      {
                        color: colors.foreground,
                        fontFamily: "Inter_500Medium",
                      },
                    ]}
                  >
                    {event.name}
                  </Text>
                  <Text
                    style={[
                      styles.pastMeta,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    {new Date(event.date + "T00:00:00").toLocaleDateString(
                      "de-DE",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}{" "}
                    · {event.startTime} – {event.endTime}
                  </Text>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeText: { fontSize: 15, minWidth: 80 },
  title: { fontSize: 16 },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  emptyState: {
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { fontSize: 14 },
  eventCard: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  eventHeader: {
    flexDirection: "row",
    gap: 12,
  },
  dateBadge: {
    alignItems: "center",
    minWidth: 36,
    gap: 2,
  },
  dateBadgeDay: { fontSize: 22 },
  dateBadgeMonth: { fontSize: 11 },
  eventInfo: { flex: 1, gap: 5 },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  eventName: { fontSize: 15, flex: 1 },
  relDayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  relDayText: { fontSize: 11 },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  eventMetaText: { fontSize: 12 },
  eventDesc: {
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  staffText: { fontSize: 12, flex: 1 },
  myEventBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  myEventText: { fontSize: 12 },
  pastCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  pastName: { fontSize: 14 },
  pastMeta: { fontSize: 12 },
});
