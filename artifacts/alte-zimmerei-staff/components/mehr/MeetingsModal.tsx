import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDienstplan } from "@/context/DienstplanContext";
import { useAppContext } from "@/context/AppContext";
import { NewMeetingModal } from "./NewMeetingModal";
import type { Event } from "@/types";

interface MeetingsModalProps {
  visible: boolean;
  onClose: () => void;
}

function getRelativeDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff > 1 && diff < 7) return `In ${diff} Tagen`;
  return "";
}

type Rsvp = "yes" | "no";

interface ProtocolEdit {
  eventId: string;
  text: string;
}

function MeetingCard({
  event,
  rsvp,
  onRsvp,
  isAdmin,
  onUpdateProtocol,
}: {
  event: Event;
  rsvp: Rsvp | undefined;
  onRsvp: (eventId: string, val: Rsvp) => void;
  isAdmin: boolean;
  onUpdateProtocol: (eventId: string, text: string) => void;
}) {
  const colors = useColors();
  const relDay = getRelativeDay(event.date);
  const isMyEvent = event.staff.some((s) => s.id === "u1");

  const [protocolOpen, setProtocolOpen] = useState(false);
  const [protocolDraft, setProtocolDraft] = useState(event.protocol ?? "");
  const [editingProtocol, setEditingProtocol] = useState(false);

  const handleSaveProtocol = () => {
    onUpdateProtocol(event.id, protocolDraft.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingProtocol(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date + "T00:00:00");
  const isPast = eventDate < today;

  return (
    <View
      style={[
        styles.eventCard,
        {
          backgroundColor: colors.card,
          borderColor: isMyEvent ? colors.primary + "44" : colors.border,
          borderRadius: 12,
        },
      ]}
    >
      <View style={styles.eventHeader}>
        <View style={styles.dateBadge}>
          <Text style={[styles.dateBadgeDay, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {new Date(event.date + "T00:00:00").getDate()}
          </Text>
          <Text style={[styles.dateBadgeMonth, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {new Date(event.date + "T00:00:00").toLocaleDateString("de-DE", { month: "short" })}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventTitleRow}>
            <Text
              style={[styles.eventName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
              numberOfLines={1}
            >
              {event.name}
            </Text>
            {relDay ? (
              <View
                style={[
                  styles.relDayBadge,
                  {
                    backgroundColor: relDay === "Heute" ? colors.success + "20" : colors.primary + "15",
                    borderRadius: 6,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.relDayText,
                    {
                      color: relDay === "Heute" ? colors.success : colors.primary,
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
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.eventMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {event.startTime} – {event.endTime}
            </Text>
            {event.location ? (
              <>
                <Text style={{ color: colors.border }}>·</Text>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.eventMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {event.location}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      {event.description ? (
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
      ) : null}

      {event.staff.length > 0 && (
        <View style={styles.staffRow}>
          <Feather name="users" size={12} color={colors.mutedForeground} />
          <Text
            style={[styles.staffText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            numberOfLines={1}
          >
            {event.staff.map((s) => s.name).join(", ")}
          </Text>
        </View>
      )}

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <View style={styles.actionRow}>
        <View style={styles.rsvpGroup}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRsvp(event.id, "yes");
            }}
            activeOpacity={0.75}
            style={[
              styles.rsvpBtn,
              {
                backgroundColor: rsvp === "yes" ? colors.success + "22" : colors.muted,
                borderColor: rsvp === "yes" ? colors.success : colors.border,
                borderRadius: 8,
              },
            ]}
          >
            <Feather
              name="check"
              size={13}
              color={rsvp === "yes" ? colors.success : colors.mutedForeground}
            />
            <Text
              style={[
                styles.rsvpText,
                {
                  color: rsvp === "yes" ? colors.success : colors.mutedForeground,
                  fontFamily: rsvp === "yes" ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              Zusagen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRsvp(event.id, "no");
            }}
            activeOpacity={0.75}
            style={[
              styles.rsvpBtn,
              {
                backgroundColor: rsvp === "no" ? colors.destructive + "18" : colors.muted,
                borderColor: rsvp === "no" ? colors.destructive : colors.border,
                borderRadius: 8,
              },
            ]}
          >
            <Feather
              name="x"
              size={13}
              color={rsvp === "no" ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.rsvpText,
                {
                  color: rsvp === "no" ? colors.destructive : colors.mutedForeground,
                  fontFamily: rsvp === "no" ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              Absagen
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setProtocolOpen((o) => !o);
            if (!protocolOpen && isAdmin && !event.protocol) {
              setEditingProtocol(true);
            }
          }}
          activeOpacity={0.75}
          style={[
            styles.protocolBtn,
            {
              backgroundColor: protocolOpen
                ? colors.primary + "18"
                : event.protocol
                ? colors.info + "15"
                : colors.muted,
              borderColor: protocolOpen
                ? colors.primary
                : event.protocol
                ? colors.info + "66"
                : colors.border,
              borderRadius: 8,
            },
          ]}
        >
          <Feather
            name="file-text"
            size={13}
            color={
              protocolOpen
                ? colors.primary
                : event.protocol
                ? colors.info
                : colors.mutedForeground
            }
          />
          <Text
            style={[
              styles.rsvpText,
              {
                color: protocolOpen
                  ? colors.primary
                  : event.protocol
                  ? colors.info
                  : colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {event.protocol ? "Protokoll" : "Protokoll"}
          </Text>
        </TouchableOpacity>
      </View>

      {protocolOpen && (
        <View
          style={[
            styles.protocolSection,
            { backgroundColor: colors.surface, borderRadius: 10, borderColor: colors.border },
          ]}
        >
          {editingProtocol && isAdmin ? (
            <>
              <Text
                style={[styles.protocolLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
              >
                Protokoll verfassen
              </Text>
              <TextInput
                value={protocolDraft}
                onChangeText={setProtocolDraft}
                placeholder="Zusammenfassung, Beschlüsse, Aufgaben..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[
                  styles.protocolInput,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_400Regular",
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    borderRadius: 8,
                  },
                ]}
              />
              <View style={styles.protocolActions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingProtocol(false);
                    setProtocolDraft(event.protocol ?? "");
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.protocolActionBtn,
                    { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: 8 },
                  ]}
                >
                  <Text style={[styles.protocolActionText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Abbrechen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProtocol}
                  activeOpacity={0.8}
                  style={[
                    styles.protocolActionBtn,
                    { backgroundColor: colors.primary, borderRadius: 8 },
                  ]}
                >
                  <Text style={[styles.protocolActionText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                    Speichern
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : event.protocol ? (
            <>
              <View style={styles.protocolViewHeader}>
                <Text style={[styles.protocolLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Protokoll
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => {
                      setProtocolDraft(event.protocol ?? "");
                      setEditingProtocol(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text
                style={[
                  styles.protocolText,
                  { color: colors.foreground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {event.protocol}
              </Text>
            </>
          ) : (
            <View style={styles.noProtocol}>
              <Feather name="file-text" size={18} color={colors.mutedForeground} />
              <Text style={[styles.noProtocolText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {isAdmin
                  ? "Noch kein Protokoll vorhanden."
                  : "Noch kein Protokoll verfügbar."}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => setEditingProtocol(true)}
                  activeOpacity={0.75}
                  style={[
                    styles.addProtocolBtn,
                    { backgroundColor: colors.primary + "15", borderRadius: 8, borderColor: colors.primary + "44" },
                  ]}
                >
                  <Feather name="plus" size={13} color={colors.primary} />
                  <Text style={[styles.rsvpText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    Hinzufügen
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function MeetingsModal({ visible, onClose }: MeetingsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, updateEvent } = useDienstplan();
  const { user } = useAppContext();
  const isAdmin = user.isAdmin === true;

  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [rsvp, setRsvp] = useState<Record<string, Rsvp>>({});

  const isMeeting = (name: string) =>
    name.toLowerCase().includes("meeting") ||
    name.toLowerCase().includes("besprechung");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = events
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d >= today && e.status !== "cancelled" && isMeeting(e.name);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastMeetings = events
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d < today && isMeeting(e.name);
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleRsvp = (eventId: string, val: Rsvp) => {
    setRsvp((prev) => {
      if (prev[eventId] === val) {
        const next = { ...prev };
        delete next[eventId];
        return next;
      }
      return { ...prev, [eventId]: val };
    });
  };

  const handleUpdateProtocol = (eventId: string, text: string) => {
    updateEvent(eventId, { protocol: text });
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background, paddingTop: insets.top || 16 },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={[styles.closeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Schließen
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Meetings
            </Text>
            {isAdmin ? (
              <TouchableOpacity
                onPress={() => setNewMeetingOpen(true)}
                activeOpacity={0.75}
                style={[
                  styles.addBtn,
                  { backgroundColor: colors.primary, borderRadius: 20 },
                ]}
              >
                <Feather name="plus" size={14} color={colors.primaryForeground} />
                <Text style={[styles.addBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                  Neu
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ minWidth: 60 }} />
            )}
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Bevorstehend
            </Text>

            {upcomingMeetings.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 },
                ]}
              >
                <Feather name="calendar" size={24} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Keine bevorstehenden Meetings
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => setNewMeetingOpen(true)}
                    activeOpacity={0.75}
                    style={[
                      styles.emptyAddBtn,
                      { backgroundColor: colors.primary + "15", borderRadius: 10, borderColor: colors.primary + "44" },
                    ]}
                  >
                    <Feather name="plus" size={14} color={colors.primary} />
                    <Text style={[styles.emptyAddText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      Meeting erstellen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              upcomingMeetings.map((event) => (
                <MeetingCard
                  key={event.id}
                  event={event}
                  rsvp={rsvp[event.id]}
                  onRsvp={handleRsvp}
                  isAdmin={isAdmin}
                  onUpdateProtocol={handleUpdateProtocol}
                />
              ))
            )}

            {pastMeetings.length > 0 && (
              <>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 24 },
                  ]}
                >
                  Vergangene Meetings
                </Text>
                {pastMeetings.map((event) => (
                  <MeetingCard
                    key={event.id}
                    event={event}
                    rsvp={rsvp[event.id]}
                    onRsvp={handleRsvp}
                    isAdmin={isAdmin}
                    onUpdateProtocol={handleUpdateProtocol}
                  />
                ))}
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <NewMeetingModal
        visible={newMeetingOpen}
        onClose={() => setNewMeetingOpen(false)}
      />
    </>
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
  closeText: { fontSize: 15, minWidth: 70 },
  title: { fontSize: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 14 },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  emptyState: {
    alignItems: "center",
    gap: 10,
    padding: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { fontSize: 14 },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyAddText: { fontSize: 14 },
  eventCard: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  eventHeader: { flexDirection: "row", gap: 12 },
  dateBadge: { alignItems: "center", minWidth: 36, gap: 2 },
  dateBadgeDay: { fontSize: 22 },
  dateBadgeMonth: { fontSize: 11 },
  eventInfo: { flex: 1, gap: 5 },
  eventTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  eventName: { fontSize: 15, flex: 1 },
  relDayBadge: { paddingHorizontal: 7, paddingVertical: 2 },
  relDayText: { fontSize: 11 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  eventMetaText: { fontSize: 12 },
  eventDesc: { fontSize: 13, lineHeight: 18, padding: 10 },
  staffRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  staffText: { fontSize: 12, flex: 1 },
  dividerLine: { height: StyleSheet.hairlineWidth },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rsvpGroup: { flexDirection: "row", gap: 8, flex: 1 },
  rsvpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
  },
  rsvpText: { fontSize: 13 },
  protocolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  protocolSection: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
  },
  protocolLabel: { fontSize: 12, letterSpacing: 0.3 },
  protocolViewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  protocolText: { fontSize: 14, lineHeight: 20 },
  noProtocol: { alignItems: "center", gap: 8, paddingVertical: 8 },
  noProtocolText: { fontSize: 13 },
  addProtocolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  protocolInput: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  protocolActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  protocolActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  protocolActionText: { fontSize: 13 },
});
