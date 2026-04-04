import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDienstplan } from "@/context/DienstplanContext";
import { useAppContext } from "@/context/AppContext";

interface NewMeetingModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember",
];
const DAY_HEADERS = ["Mo","Di","Mi","Do","Fr","Sa","So"];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
const ITEM_H = 48;

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const firstDayMon = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days: Array<{ day: number; month: number; year: number; current: boolean }> = [];

  for (let i = firstDayMon - 1; i >= 0; i--) {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    days.push({ day: daysInPrevMonth - i, month: pm, year: py, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, month, year, current: true });
  }
  const rem = 42 - days.length;
  const nm = month === 11 ? 0 : month + 1;
  const ny = month === 11 ? year + 1 : year;
  for (let d = 1; d <= rem; d++) {
    days.push({ day: d, month: nm, year: ny, current: false });
  }
  return days;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

interface DrumPickerProps {
  items: string[];
  initialIdx?: number;
  onChange: (val: string) => void;
  width?: number;
}

function DrumPicker({ items, initialIdx = 0, onChange, width = 72 }: DrumPickerProps) {
  const colors = useColors();
  const ref = useRef<ScrollView>(null);
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: initialIdx * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, [initialIdx]);

  const handleEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.max(0, Math.min(Math.round(y / ITEM_H), items.length - 1));
      setSelectedIdx(idx);
      onChange(items[idx]);
    },
    [items, onChange]
  );

  return (
    <View style={[styles.drum, { width, height: ITEM_H * 3 }]}>
      <View
        style={[
          styles.drumHighlight,
          {
            top: ITEM_H,
            height: ITEM_H,
            backgroundColor: colors.primary + "18",
            borderTopColor: colors.primary + "55",
            borderBottomColor: colors.primary + "55",
          },
        ]}
      />
      <View
        style={[styles.drumFadeTop, { backgroundColor: colors.card }]}
        pointerEvents="none"
      />
      <View
        style={[styles.drumFadeBottom, { backgroundColor: colors.card }]}
        pointerEvents="none"
      />
      <ScrollView
        ref={ref}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onMomentumScrollEnd={handleEnd}
        onScrollEndDrag={handleEnd}
        nestedScrollEnabled
      >
        {items.map((item, idx) => (
          <View key={idx} style={[styles.drumItem, { height: ITEM_H }]}>
            <Text
              style={[
                styles.drumText,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  opacity: idx === selectedIdx ? 1 : 0.3,
                  fontSize: idx === selectedIdx ? 24 : 20,
                },
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function NewMeetingModal({ visible, onClose }: NewMeetingModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEvent } = useDienstplan();
  const { user } = useAppContext();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("11");
  const [endMinute, setEndMinute] = useState("00");

  const [description, setDescription] = useState("");

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const canCreate = selectedDate !== null;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const calDays = getCalendarDays(viewYear, viewMonth);

  const handleCreate = () => {
    if (!selectedDate) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addEvent({
      name: "Team-Meeting",
      date: selectedDate,
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      location: "Veranstaltungsraum",
      description: description.trim() || undefined,
      djs: [],
      staff: [{ id: user.id, name: user.name, role: user.role }],
      flyerUri: undefined,
    });
    setSelectedDate(null);
    setDescription("");
    onClose();
  };

  const formatSelectedDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top || 16 }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Abbrechen
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Neues Meeting
            </Text>
            <TouchableOpacity
              onPress={handleCreate}
              activeOpacity={canCreate ? 0.8 : 1}
              style={[
                styles.createBtn,
                {
                  backgroundColor: canCreate ? colors.primary : colors.muted,
                  borderRadius: 20,
                  opacity: canCreate ? 1 : 0.45,
                },
              ]}
            >
              <Text style={[styles.createBtnText, { color: canCreate ? colors.primaryForeground : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                Erstellen
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.nameCard,
                { backgroundColor: colors.primary + "12", borderColor: colors.primary + "44", borderRadius: 12 },
              ]}
            >
              <Feather name="users" size={16} color={colors.primary} />
              <Text style={[styles.nameText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                Team-Meeting
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Datum
            </Text>

            {selectedDate && (
              <View style={[styles.selectedDateRow, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "44", borderRadius: 10 }]}>
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.selectedDateText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {formatSelectedDate(selectedDate)}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Feather name="x" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
              <View style={styles.calNav}>
                <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn} activeOpacity={0.7}>
                  <Feather name="chevron-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.calMonthText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn} activeOpacity={0.7}>
                  <Feather name="chevron-right" size={20} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <View style={styles.calDayHeaders}>
                {DAY_HEADERS.map((d) => (
                  <Text
                    key={d}
                    style={[styles.calDayHeader, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.calGrid}>
                {calDays.map((cell, idx) => {
                  const dateStr = toDateStr(cell.year, cell.month, cell.day);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        if (!cell.current || isPast) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedDate(dateStr);
                      }}
                      activeOpacity={cell.current && !isPast ? 0.75 : 1}
                      style={[
                        styles.calCell,
                        isSelected && { backgroundColor: colors.primary, borderRadius: 10 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calCellText,
                          {
                            color: isSelected
                              ? colors.primaryForeground
                              : isToday
                              ? colors.primary
                              : !cell.current || isPast
                              ? colors.mutedForeground
                              : colors.foreground,
                            fontFamily: isToday || isSelected ? "Inter_700Bold" : "Inter_400Regular",
                            opacity: (!cell.current || isPast) && !isSelected ? 0.35 : 1,
                          },
                        ]}
                      >
                        {cell.day}
                      </Text>
                      {isToday && !isSelected && (
                        <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 20 }]}>
              Uhrzeit
            </Text>

            <View style={[styles.timeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
              <View style={styles.timeBlock}>
                <Text style={[styles.timeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Beginn
                </Text>
                <View style={styles.drumRow}>
                  <DrumPicker
                    items={HOURS}
                    initialIdx={9}
                    onChange={setStartHour}
                    width={64}
                  />
                  <Text style={[styles.timeSep, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>:</Text>
                  <DrumPicker
                    items={MINUTES}
                    initialIdx={0}
                    onChange={setStartMinute}
                    width={64}
                  />
                </View>
              </View>

              <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />

              <View style={styles.timeBlock}>
                <Text style={[styles.timeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Ende
                </Text>
                <View style={styles.drumRow}>
                  <DrumPicker
                    items={HOURS}
                    initialIdx={11}
                    onChange={setEndHour}
                    width={64}
                  />
                  <Text style={[styles.timeSep, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>:</Text>
                  <DrumPicker
                    items={MINUTES}
                    initialIdx={0}
                    onChange={setEndMinute}
                    width={64}
                  />
                </View>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 20 }]}>
              Beschreibung{" "}
              <Text style={{ color: colors.mutedForeground, fontWeight: "400", fontSize: 13 }}>
                (optional)
              </Text>
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Agenda, Hinweise oder sonstige Infos..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[
                styles.descInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.muted,
                  borderColor: description.length > 0 ? colors.primary + "66" : colors.border,
                  fontFamily: "Inter_400Regular",
                  borderRadius: 12,
                },
              ]}
            />
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
  cancelText: { fontSize: 15, minWidth: 80 },
  title: { fontSize: 16 },
  createBtn: { paddingHorizontal: 16, paddingVertical: 8, minWidth: 80, alignItems: "center" },
  createBtnText: { fontSize: 14 },
  body: { flex: 1, padding: 16 },
  nameCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  nameText: { fontSize: 16 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  selectedDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  selectedDateText: { flex: 1, fontSize: 14 },
  calCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingBottom: 8,
  },
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  calNavBtn: { padding: 8 },
  calMonthText: { fontSize: 15 },
  calDayHeaders: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  calDayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    paddingBottom: 4,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  calCell: {
    width: "14.285%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  calCellText: { fontSize: 14 },
  todayDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  timeCard: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingVertical: 16,
  },
  timeBlock: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  timeLabel: { fontSize: 12, letterSpacing: 0.5 },
  drumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeSep: { fontSize: 28, marginBottom: 2 },
  timeDivider: { width: StyleSheet.hairlineWidth },
  drum: {
    overflow: "hidden",
    position: "relative",
  },
  drumHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
    pointerEvents: "none",
  },
  drumFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 0.8,
    opacity: 0.55,
    zIndex: 2,
    pointerEvents: "none",
  },
  drumFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 0.8,
    opacity: 0.55,
    zIndex: 2,
    pointerEvents: "none",
  },
  drumItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  drumText: {},
  descInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 20,
  },
});
