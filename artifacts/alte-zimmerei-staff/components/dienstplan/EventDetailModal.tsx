import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDienstplan } from "@/context/DienstplanContext";
import { useAppContext } from "@/context/AppContext";
import type { Event } from "@/types";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deleteEvent } = useDienstplan();
  const { user } = useAppContext();

  if (!event) return null;

  const date = new Date(event.date + "T00:00:00");
  const dateStr = date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDeleteEvent = () => {
    Alert.alert(
      "Event löschen",
      `Möchtest du "${event.name}" wirklich löschen? Alle zugehörigen Schichten werden ebenfalls entfernt.`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            deleteEvent(event.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleOpenFlyer = () => {
    if (event.flyerUri) {
      Linking.openURL(event.flyerUri);
    }
  };

  return (
    <Modal
      visible={!!event}
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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
            numberOfLines={1}
          >
            Event-Details
          </Text>
          {user.isAdmin ? (
            <TouchableOpacity onPress={handleDeleteEvent} activeOpacity={0.7} style={styles.deleteBtn}>
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          ) : (
            <View style={styles.closeBtn} />
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Flyer image */}
          {event.flyerUri && (
            <TouchableOpacity onPress={handleOpenFlyer} activeOpacity={0.9}>
              <Image
                source={{ uri: event.flyerUri }}
                style={[styles.flyerImage, { borderRadius: 14 }]}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.flyerDownloadBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="download" size={13} color="#fff" />
                <Text style={[styles.flyerDownloadText, { fontFamily: "Inter_600SemiBold" }]}>
                  Flyer öffnen
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Event name */}
          <Text
            style={[
              styles.eventName,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {event.name}
          </Text>

          {/* Date / time / location chips */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="calendar" size={13} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {dateStr}
              </Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="clock" size={13} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {event.startTime} – {event.endTime} Uhr
              </Text>
            </View>
            {!!event.location && (
              <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="map-pin" size={13} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Beschreibung
              </Text>
              <Text style={[styles.descriptionText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {event.description}
              </Text>
            </View>
          )}

          {/* DJs */}
          {event.djs.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Feather name="music" size={15} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Musik / DJs
                </Text>
              </View>
              {event.djs.map((dj, idx) => (
                <View key={idx} style={styles.djRow}>
                  <View style={[styles.djDot, { backgroundColor: colors.primary + "40" }]}>
                    <Feather name="headphones" size={13} color={colors.primary} />
                  </View>
                  <Text style={[styles.djName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {dj}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Staff */}
          {event.staff.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Feather name="users" size={15} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Personal ({event.staff.length})
                </Text>
              </View>
              {event.staff.map((member) => (
                <View key={member.id} style={styles.staffRow}>
                  <Avatar name={member.name} size={34} />
                  <View style={styles.staffInfo}>
                    <Text style={[styles.staffName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      {member.name}
                    </Text>
                    <Text style={[styles.staffRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {member.role}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Flyer download (when no image) */}
          {!event.flyerUri && (
            <View style={[styles.noFlyerBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="image" size={18} color={colors.mutedForeground} />
              <Text style={[styles.noFlyerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Kein Flyer hinterlegt
              </Text>
            </View>
          )}
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
  closeBtn: { width: 36, alignItems: "flex-start" },
  deleteBtn: { width: 36, alignItems: "flex-end" },
  headerTitle: { fontSize: 16, flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  flyerImage: {
    width: "100%",
    height: 200,
    marginBottom: 4,
  },
  flyerDownloadBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  flyerDownloadText: {
    color: "#fff",
    fontSize: 12,
  },
  eventName: {
    fontSize: 22,
    marginTop: 4,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13 },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionTitle: { fontSize: 14 },
  descriptionText: { fontSize: 13, lineHeight: 20 },
  djRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  djDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  djName: { fontSize: 14 },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  staffInfo: { gap: 1 },
  staffName: { fontSize: 14 },
  staffRole: { fontSize: 12 },
  noFlyerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  noFlyerText: { fontSize: 13 },
});
