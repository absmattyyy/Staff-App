import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { useDienstplan } from "@/context/DienstplanContext";
import type { EventStaffMember } from "@/types";

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Staff pool ───────────────────────────────────────────────────────────────
const ALL_STAFF: { id: string; name: string }[] = [
  { id: "u1", name: "Anna Müller" },
  { id: "u3", name: "Jonas Schreiber" },
  { id: "u4", name: "Lena Fischer" },
  { id: "u5", name: "Tobias Klein" },
  { id: "u6", name: "Sophie Lang" },
  { id: "u7", name: "Max Huber" },
  { id: "u8", name: "Kevin Bauer" },
  { id: "u9", name: "Sarah Wolf" },
];

type RoleKey = "bar" | "springer" | "kasse" | "garderobe" | "security";

const ROLES: { key: RoleKey; label: string; icon: string; multi: boolean }[] = [
  { key: "bar", label: "Bar", icon: "coffee", multi: true },
  { key: "springer", label: "Springer", icon: "zap", multi: true },
  { key: "kasse", label: "Kasse", icon: "dollar-sign", multi: false },
  { key: "garderobe", label: "Garderobe", icon: "wind", multi: false },
  { key: "security", label: "Security", icon: "shield", multi: true },
];

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const CAL_WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function MiniCalendar({
  selectedDay,
  onSelect,
}: {
  selectedDay: number | null;
  onSelect: (day: number) => void;
}) {
  const colors = useColors();
  // April 2026: starts on Wednesday (index 2 in Mo-based week)
  const firstDow = 2; // 0=Mo … 6=So
  const daysInMonth = 30;
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={calStyles.container}>
      {/* Weekday headers */}
      <View style={calStyles.headerRow}>
        {CAL_WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={[calStyles.headerCell, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
          >
            {d}
          </Text>
        ))}
      </View>
      {/* Day grid */}
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={calStyles.row}>
          {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
            const isToday = day === 4;
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => day && onSelect(day)}
                activeOpacity={day ? 0.7 : 1}
                style={[
                  calStyles.cell,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    borderRadius: 8,
                  },
                ]}
              >
                {day ? (
                  <Text
                    style={[
                      calStyles.dayText,
                      {
                        color: isSelected
                          ? colors.primaryForeground
                          : isToday
                          ? colors.primary
                          : colors.foreground,
                        fontFamily: isSelected || isToday ? "Inter_700Bold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {day}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: { marginTop: 2 },
  headerRow: { flexDirection: "row", marginBottom: 4 },
  headerCell: { flex: 1, textAlign: "center", fontSize: 11, paddingVertical: 4 },
  row: { flexDirection: "row" },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  dayText: { fontSize: 13 },
});

// ─── Drum Picker ──────────────────────────────────────────────────────────────
const ITEM_H = 44;

function DrumPicker({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const colors = useColors();
  const ref = useRef<FlatList>(null);
  const currentIdx = items.indexOf(value);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    onChange(items[clamped]);
  };

  return (
    <View style={drumStyles.wrapper}>
      {/* Selection highlight */}
      <View
        style={[drumStyles.highlight, { borderColor: colors.primary, backgroundColor: colors.primary + "18" }]}
        pointerEvents="none"
      />
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(it) => it}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        initialScrollIndex={currentIdx}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => {
          const isSelected = item === value;
          return (
            <View style={[drumStyles.item, { height: ITEM_H }]}>
              <Text
                style={[
                  drumStyles.itemText,
                  {
                    color: isSelected ? colors.primary : colors.mutedForeground,
                    fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                    fontSize: isSelected ? 22 : 16,
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const drumStyles = StyleSheet.create({
  wrapper: {
    width: 64,
    height: ITEM_H * 3,
    overflow: "hidden",
    position: "relative",
  },
  highlight: {
    position: "absolute",
    top: ITEM_H,
    left: 4,
    right: 4,
    height: ITEM_H,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {},
});

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

function TimePicker({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  label: string;
  hour: string;
  minute: string;
  onHourChange: (h: string) => void;
  onMinuteChange: (m: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={timeStyles.container}>
      <Text style={[timeStyles.label, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
      <View style={timeStyles.drums}>
        <DrumPicker items={HOURS} value={hour} onChange={onHourChange} />
        <Text style={[timeStyles.colon, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          :
        </Text>
        <DrumPicker items={MINUTES} value={minute} onChange={onMinuteChange} />
      </View>
    </View>
  );
}

const timeStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", gap: 6 },
  label: { fontSize: 12, marginBottom: 2 },
  drums: { flexDirection: "row", alignItems: "center", gap: 4 },
  colon: { fontSize: 24, marginBottom: 4 },
});

// ─── Staff Role Picker ────────────────────────────────────────────────────────
type StaffAssignment = { [K in RoleKey]: { id: string; name: string }[] };

function StaffSection({
  assignment,
  onChange,
}: {
  assignment: StaffAssignment;
  onChange: (a: StaffAssignment) => void;
}) {
  const colors = useColors();
  const [expandedRole, setExpandedRole] = useState<RoleKey | null>(null);

  const togglePerson = (role: RoleKey, person: { id: string; name: string }, multi: boolean) => {
    const current = assignment[role];
    const exists = current.find((p) => p.id === person.id);
    let next: { id: string; name: string }[];
    if (exists) {
      next = current.filter((p) => p.id !== person.id);
    } else {
      next = multi ? [...current, person] : [person];
    }
    onChange({ ...assignment, [role]: next });
    if (!multi) setExpandedRole(null);
  };

  return (
    <View style={staffStyles.container}>
      {ROLES.map(({ key, label, icon, multi }) => {
        const assigned = assignment[key];
        const isExpanded = expandedRole === key;
        return (
          <View key={key}>
            <TouchableOpacity
              onPress={() => setExpandedRole(isExpanded ? null : key)}
              activeOpacity={0.7}
              style={[
                staffStyles.roleRow,
                {
                  backgroundColor: assigned.length > 0 ? colors.primary + "12" : colors.muted,
                  borderColor: assigned.length > 0 ? colors.primary + "40" : colors.border,
                },
              ]}
            >
              <View style={staffStyles.roleLeft}>
                <View
                  style={[
                    staffStyles.roleIcon,
                    { backgroundColor: assigned.length > 0 ? colors.primary + "25" : colors.border },
                  ]}
                >
                  <Feather
                    name={icon as any}
                    size={14}
                    color={assigned.length > 0 ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View style={staffStyles.roleLabelBlock}>
                  <Text
                    style={[staffStyles.roleLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                  >
                    {label}
                  </Text>
                  {!multi && (
                    <Text style={[staffStyles.roleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      1 Person
                    </Text>
                  )}
                </View>
              </View>
              <View style={staffStyles.roleRight}>
                {assigned.length > 0 && (
                  <View style={[staffStyles.countBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[staffStyles.countText, { fontFamily: "Inter_700Bold" }]}>
                      {assigned.length}
                    </Text>
                  </View>
                )}
                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={15}
                  color={colors.mutedForeground}
                />
              </View>
            </TouchableOpacity>

            {/* Assigned chips */}
            {assigned.length > 0 && !isExpanded && (
              <View style={staffStyles.chipRow}>
                {assigned.map((p) => (
                  <View
                    key={p.id}
                    style={[staffStyles.chip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}
                  >
                    <Text style={[staffStyles.chipText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                      {p.name}
                    </Text>
                    <TouchableOpacity onPress={() => togglePerson(key, p, multi)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Feather name="x" size={12} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Staff picker */}
            {isExpanded && (
              <View style={[staffStyles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {ALL_STAFF.map((person) => {
                  const isChosen = assigned.some((p) => p.id === person.id);
                  return (
                    <TouchableOpacity
                      key={person.id}
                      onPress={() => togglePerson(key, person, multi)}
                      activeOpacity={0.7}
                      style={[
                        staffStyles.pickerItem,
                        {
                          backgroundColor: isChosen ? colors.primary + "15" : "transparent",
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[staffStyles.personAvatar, { backgroundColor: isChosen ? colors.primary + "30" : colors.muted }]}>
                        <Feather name="user" size={12} color={isChosen ? colors.primary : colors.mutedForeground} />
                      </View>
                      <Text style={[staffStyles.personName, { color: colors.foreground, fontFamily: isChosen ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                        {person.name}
                      </Text>
                      {isChosen && <Feather name="check" size={15} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
                {multi && assigned.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setExpandedRole(null)}
                    style={[staffStyles.doneBtn, { borderTopColor: colors.border }]}
                  >
                    <Text style={[staffStyles.doneBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      Fertig
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const staffStyles = StyleSheet.create({
  container: { gap: 8 },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  roleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  roleIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  roleLabelBlock: { gap: 1 },
  roleLabel: { fontSize: 14 },
  roleSub: { fontSize: 11 },
  roleRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 11 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 4, paddingTop: 4, paddingBottom: 2 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12 },
  picker: { borderWidth: 1, borderRadius: 10, marginTop: 2, overflow: "hidden" },
  pickerItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  personAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  personName: { flex: 1, fontSize: 14 },
  doneBtn: { padding: 12, alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth },
  doneBtnText: { fontSize: 14 },
});

// ─── Main Modal ───────────────────────────────────────────────────────────────
const EMPTY_ASSIGNMENT: StaffAssignment = { bar: [], springer: [], kasse: [], garderobe: [], security: [] };

export function CreateEventModal({ visible, onClose }: CreateEventModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEvent } = useDienstplan();

  const [name, setName] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startHour, setStartHour] = useState("20");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("04");
  const [endMin, setEndMin] = useState("00");
  const [description, setDescription] = useState("");
  const [djInput, setDjInput] = useState("");
  const [djs, setDjs] = useState<string[]>([]);
  const [assignment, setAssignment] = useState<StaffAssignment>(EMPTY_ASSIGNMENT);
  const [flyerUri, setFlyerUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreate = name.trim().length > 0 && selectedDay !== null;

  const handlePickFlyer = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setFlyerUri(result.assets[0].uri);
    }
  };

  const handleAddDj = () => {
    const trimmed = djInput.trim();
    if (trimmed && !djs.includes(trimmed)) {
      setDjs((prev) => [...prev, trimmed]);
      setDjInput("");
    }
  };

  const handleRemoveDj = (dj: string) => setDjs((prev) => prev.filter((d) => d !== dj));

  const buildStaffList = (): EventStaffMember[] => {
    const result: EventStaffMember[] = [];
    for (const { key, label } of ROLES) {
      for (const p of assignment[key]) {
        result.push({ id: p.id, name: p.name, role: label });
      }
    }
    return result;
  };

  const handleCreate = async () => {
    if (!canCreate || selectedDay === null) return;
    setLoading(true);
    const dateStr = `2026-04-${String(selectedDay).padStart(2, "0")}`;
    await new Promise((r) => setTimeout(r, 400));
    addEvent({
      name: name.trim(),
      date: dateStr,
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
      location: "",
      description: description.trim() || undefined,
      djs,
      staff: buildStaffList(),
      flyerUri: flyerUri ?? undefined,
    });
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setSelectedDay(null);
    setStartHour("20");
    setStartMin("00");
    setEndHour("04");
    setEndMin("00");
    setDescription("");
    setDjInput("");
    setDjs([]);
    setAssignment(EMPTY_ASSIGNMENT);
    setFlyerUri(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
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
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Abbrechen
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Event erstellen
            </Text>
            <TouchableOpacity
              onPress={handleCreate}
              activeOpacity={canCreate ? 0.7 : 1}
              style={[styles.createBtn, { backgroundColor: canCreate ? colors.primary : colors.muted, opacity: canCreate ? 1 : 0.5 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.createBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                  Erstellen
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Event name */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Event-Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="z.B. TranceFloor"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            />

            {/* Date – mini calendar */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium", marginTop: 0 }]}>
                Datum *
              </Text>
              {selectedDay !== null && (
                <Text style={[styles.selectedDateText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {`${String(selectedDay).padStart(2, "0")}.04.2026`}
                </Text>
              )}
            </View>
            <View style={[styles.calendarBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.calMonth, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                April 2026
              </Text>
              <MiniCalendar selectedDay={selectedDay} onSelect={setSelectedDay} />
            </View>

            {/* Times */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Uhrzeit *
            </Text>
            <View style={[styles.timeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TimePicker
                label="Beginn"
                hour={startHour}
                minute={startMin}
                onHourChange={setStartHour}
                onMinuteChange={setStartMin}
              />
              <View style={[styles.timeSeparator, { backgroundColor: colors.border }]} />
              <TimePicker
                label="Ende"
                hour={endHour}
                minute={endMin}
                onHourChange={setEndHour}
                onMinuteChange={setEndMin}
              />
            </View>

            {/* Description */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Beschreibung
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Hinweise, Ablauf, Dresscode…"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.inputMulti, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            />

            {/* DJs */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Musik / DJs
            </Text>
            <View style={styles.djInputRow}>
              <TextInput
                value={djInput}
                onChangeText={setDjInput}
                placeholder="DJ-Name eingeben"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
                onSubmitEditing={handleAddDj}
                style={[styles.djInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
              />
              <TouchableOpacity
                onPress={handleAddDj}
                activeOpacity={0.7}
                style={[styles.djAddBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {djs.length > 0 && (
              <View style={styles.tagList}>
                {djs.map((dj) => (
                  <View key={dj} style={[styles.tag, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
                    <Text style={[styles.tagText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{dj}</Text>
                    <TouchableOpacity onPress={() => handleRemoveDj(dj)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Feather name="x" size={13} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Personal */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Personal
            </Text>
            <StaffSection assignment={assignment} onChange={setAssignment} />

            {/* Flyer */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Flyer
            </Text>
            {flyerUri ? (
              <View style={styles.flyerPreviewBox}>
                <Image source={{ uri: flyerUri }} style={styles.flyerPreview} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => setFlyerUri(null)}
                  style={[styles.flyerRemoveBtn, { backgroundColor: colors.destructive }]}
                >
                  <Feather name="trash-2" size={14} color="#fff" />
                  <Text style={[styles.flyerRemoveText, { fontFamily: "Inter_600SemiBold" }]}>Entfernen</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickFlyer}
                activeOpacity={0.7}
                style={[styles.flyerPickBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Feather name="upload" size={18} color={colors.primary} />
                <Text style={[styles.flyerPickText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  Flyer hochladen
                </Text>
                <Text style={[styles.flyerPickSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  JPG, PNG aus der Galerie
                </Text>
              </TouchableOpacity>
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
  createBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { fontSize: 14 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 18, fontWeight: "500" },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  selectedDateText: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  inputMulti: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  calendarBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  calMonth: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  timeSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 60,
    marginHorizontal: 8,
  },
  djInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  djInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  djAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tagList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 13 },
  flyerPickBtn: {
    borderWidth: 1,
    borderRadius: 14,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  flyerPickText: { fontSize: 15 },
  flyerPickSub: { fontSize: 12 },
  flyerPreviewBox: { borderRadius: 14, overflow: "hidden", position: "relative" },
  flyerPreview: { width: "100%", height: 200 },
  flyerRemoveBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  flyerRemoveText: { color: "#fff", fontSize: 13 },
});
