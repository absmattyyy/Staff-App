import React, { useState, useEffect } from "react";
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
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { Shift } from "@/types";

interface NewSwapRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (shift: Shift, note?: string) => void;
  availableShifts: Shift[];
  preselectedShift?: Shift | null;
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const REASON_PRESETS = [
  "Familiärer Termin",
  "Arzttermin",
  "Urlaub",
  "Sonstiges",
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#30D158",
  changed: "#FFD60A",
  open: "#636366",
  cancelled: "#FF453A",
};

export function NewSwapRequestModal({
  visible,
  onClose,
  onSubmit,
  availableShifts,
  preselectedShift,
}: NewSwapRequestModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [note, setNote] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedShift(preselectedShift ?? null);
      setNote("");
      setSelectedPreset(null);
    }
  }, [visible, preselectedShift]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = availableShifts
    .filter((s) => {
      const d = new Date(s.date + "T00:00:00");
      return d >= today && s.status !== "cancelled";
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const canSubmit = selectedShift !== null;

  const handleSubmit = () => {
    if (!selectedShift) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const finalNote = selectedPreset ?? (note.trim() || undefined);
    onSubmit(selectedShift, finalNote);
    onClose();
  };

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
            {
              backgroundColor: colors.background,
              paddingTop: insets.top || 16,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.cancelBtn}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                Abbrechen
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Tausch anfragen
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.7 : 1}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: canSubmit ? colors.primary : colors.muted,
                  opacity: canSubmit ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.submitBtnText,
                  {
                    color: colors.primaryForeground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                Anfragen
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                  borderRadius: 10,
                },
              ]}
            >
              <Feather name="info" size={14} color={colors.primary} />
              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                Wähle eine deiner Schichten aus. Nach einem Übernahmeangebot
                eines Kollegen wird der Besitzer um Genehmigung gebeten.
              </Text>
            </View>

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Welche Schicht möchtest du tauschen?
            </Text>

            {upcomingShifts.length === 0 ? (
              <View
                style={[
                  styles.noShifts,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.noShiftsText,
                    {
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    },
                  ]}
                >
                  Keine bevorstehenden Schichten vorhanden
                </Text>
              </View>
            ) : (
              upcomingShifts.map((shift) => {
                const isSelected = selectedShift?.id === shift.id;
                const dotColor = STATUS_COLORS[shift.status] ?? colors.primary;
                return (
                  <TouchableOpacity
                    key={shift.id}
                    onPress={() => setSelectedShift(shift)}
                    activeOpacity={0.75}
                    style={[
                      styles.shiftRow,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "15"
                          : colors.card,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        borderRadius: 12,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.shiftInfo}>
                      <View style={styles.shiftNameRow}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: dotColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.shiftName,
                            {
                              color: colors.foreground,
                              fontFamily: "Inter_600SemiBold",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {shift.eventName}
                        </Text>
                      </View>
                      <View style={styles.shiftDetails}>
                        <Feather
                          name="calendar"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.shiftDetailText,
                            {
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                        >
                          {formatDate(shift.date)}
                        </Text>
                        <Feather
                          name="clock"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.shiftDetailText,
                            {
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                        >
                          {shift.startTime} – {shift.endTime}
                        </Text>
                      </View>
                      <View style={styles.shiftDetails}>
                        <Feather
                          name="briefcase"
                          size={11}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.shiftDetailText,
                            {
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {shift.role} · {shift.location}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

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
              Grund (optional)
            </Text>
            <View style={styles.presetRow}>
              {REASON_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => {
                    setSelectedPreset(preset === selectedPreset ? null : preset);
                    setNote("");
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        selectedPreset === preset
                          ? colors.primary + "20"
                          : colors.muted,
                      borderColor:
                        selectedPreset === preset
                          ? colors.primary
                          : colors.border,
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color:
                          selectedPreset === preset
                            ? colors.primary
                            : colors.mutedForeground,
                        fontFamily:
                          selectedPreset === preset
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
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
                value={note}
                onChangeText={setNote}
                placeholder="Eigener Grund (optional)"
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[
                  styles.noteInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                    borderRadius: 10,
                  },
                ]}
              />
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
  submitBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 14 },
  body: { flex: 1, padding: 16 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  noShifts: {
    alignItems: "center",
    gap: 8,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  noShiftsText: { fontSize: 13 },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shiftInfo: { flex: 1, gap: 4 },
  shiftNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  shiftName: { fontSize: 14, flex: 1 },
  shiftDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  shiftDetailText: { fontSize: 12 },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: { fontSize: 13 },
  noteInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
