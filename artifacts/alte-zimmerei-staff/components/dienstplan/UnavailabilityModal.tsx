import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDienstplan } from "@/context/DienstplanContext";

interface UnavailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedDate?: string;
}

const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function getDayInfo(day: number) {
  const date = new Date(2026, 3, day);
  return {
    day,
    weekday: WEEKDAYS[date.getDay()],
    isToday: day === 4,
    dateStr: `2026-04-${String(day).padStart(2, "0")}`,
  };
}

const REASON_PRESETS = [
  "Urlaub",
  "Arzttermin",
  "Familiäre Verpflichtung",
  "Sonstiges",
];

export function UnavailabilityModal({
  visible,
  onClose,
  preselectedDate,
}: UnavailabilityModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addUnavailability, removeUnavailability, unavailabilities, myUnavailabilityDates } = useDienstplan();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (selectedDays.length === 0) return;
    const finalReason = selectedPreset ?? reason.trim() ?? undefined;
    selectedDays.forEach((day) => {
      const dateStr = `2026-04-${String(day).padStart(2, "0")}`;
      if (!myUnavailabilityDates.has(dateStr)) {
        addUnavailability(dateStr, finalReason || undefined);
      }
    });
    setSelectedDays([]);
    setReason("");
    setSelectedPreset(null);
    onClose();
  };

  const handleRemove = (id: string) => {
    removeUnavailability(id);
  };

  const myEntries = unavailabilities.filter((u) => u.userId === "u1");

  const canSave = selectedDays.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background, paddingTop: insets.top || 16 },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Abbrechen
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Nicht verfügbar
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={canSave ? 0.7 : 1}
              style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.muted, opacity: canSave ? 1 : 0.5 }]}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                Speichern
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info */}
            <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Markiere die Tage, an denen du im April 2026 nicht verfügbar bist. Dein Inhaber wird informiert.
              </Text>
            </View>

            {/* Day selector */}
            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Tage auswählen — April 2026
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayScrollContent}
              style={styles.dayScroll}
            >
              {MONTH_DAYS.map((day) => {
                const { weekday, isToday, dateStr } = getDayInfo(day);
                const isSelected = selectedDays.includes(day);
                const isAlreadyMarked = myUnavailabilityDates.has(dateStr);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => !isAlreadyMarked && toggleDay(day)}
                    activeOpacity={isAlreadyMarked ? 1 : 0.75}
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: isAlreadyMarked
                          ? colors.destructive + "20"
                          : isSelected
                          ? colors.primary
                          : "transparent",
                        borderRadius: 12,
                        borderWidth: isAlreadyMarked ? 1 : 0,
                        borderColor: isAlreadyMarked ? colors.destructive + "50" : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayLabel,
                        {
                          color: isAlreadyMarked
                            ? colors.destructive
                            : isSelected
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
                          color: isAlreadyMarked
                            ? colors.destructive
                            : isSelected
                            ? colors.primaryForeground
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
                    {isAlreadyMarked && (
                      <Feather name="x" size={9} color={colors.destructive} />
                    )}
                    {!isAlreadyMarked && <View style={{ width: 9, height: 9 }} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedDays.length > 0 && (
              <Text style={[styles.selectionSummary, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {selectedDays.length} {selectedDays.length === 1 ? "Tag" : "Tage"} ausgewählt
              </Text>
            )}

            {/* Reason presets */}
            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Grund (optional)
            </Text>
            <View style={styles.presetRow}>
              {REASON_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => {
                    setSelectedPreset(preset === selectedPreset ? null : preset);
                    setReason("");
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        selectedPreset === preset ? colors.primary + "20" : colors.muted,
                      borderColor:
                        selectedPreset === preset ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: selectedPreset === preset ? colors.primary : colors.mutedForeground,
                        fontFamily:
                          selectedPreset === preset ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPreset === null && (
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Eigener Grund (optional)"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.reasonInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              />
            )}

            {/* Existing entries */}
            {myEntries.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 24 }]}>
                  Bereits eingetragen
                </Text>
                {myEntries.map((entry) => {
                  const d = new Date(entry.date + "T00:00:00");
                  const formatted = d.toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  return (
                    <View
                      key={entry.id}
                      style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={[styles.entryDot, { backgroundColor: colors.destructive + "30" }]}>
                        <Feather name="x-circle" size={13} color={colors.destructive} />
                      </View>
                      <View style={styles.entryInfo}>
                        <Text style={[styles.entryDate, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                          {formatted}
                        </Text>
                        {entry.reason && (
                          <Text style={[styles.entryReason, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                            {entry.reason}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemove(entry.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={15} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  cancelBtn: { minWidth: 80 },
  cancelText: { fontSize: 15 },
  title: { fontSize: 16 },
  saveBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14 },
  body: { flex: 1, padding: 16 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  dayScroll: { marginHorizontal: -16 },
  dayScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  selectionSummary: { fontSize: 13, marginTop: 8, marginBottom: 16 },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: { fontSize: 13 },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  entryDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  entryInfo: { flex: 1, gap: 2 },
  entryDate: { fontSize: 14 },
  entryReason: { fontSize: 12 },
});
