import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDienstplan } from "@/context/DienstplanContext";
import type { EventStaffMember } from "@/types";

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
}

const STAFF_SUGGESTIONS: EventStaffMember[] = [
  { id: "u1", name: "Anna Müller", role: "Serviceleiterin" },
  { id: "u3", name: "Jonas Schreiber", role: "Servicemitarbeiter" },
  { id: "u4", name: "Lena Fischer", role: "Servicemitarbeiterin" },
  { id: "u5", name: "Tobias Klein", role: "Küche" },
  { id: "u6", name: "Sophie Lang", role: "Servicemitarbeiterin" },
  { id: "u7", name: "Max Huber", role: "Bar" },
];

export function CreateEventModal({ visible, onClose }: CreateEventModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEvent } = useDienstplan();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [djInput, setDjInput] = useState("");
  const [djs, setDjs] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<EventStaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [flyerNote, setFlyerNote] = useState("");

  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const isTimeValid = (t: string) => /^\d{2}:\d{2}$/.test(t);

  const canCreate =
    name.trim().length > 0 &&
    isDateValid &&
    isTimeValid(startTime) &&
    isTimeValid(endTime) &&
    location.trim().length > 0;

  const handleAddDj = () => {
    const trimmed = djInput.trim();
    if (trimmed && !djs.includes(trimmed)) {
      setDjs((prev) => [...prev, trimmed]);
      setDjInput("");
    }
  };

  const handleRemoveDj = (dj: string) => {
    setDjs((prev) => prev.filter((d) => d !== dj));
  };

  const toggleStaff = (member: EventStaffMember) => {
    setSelectedStaff((prev) => {
      const exists = prev.find((s) => s.id === member.id);
      if (exists) return prev.filter((s) => s.id !== member.id);
      return [...prev, member];
    });
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    addEvent({
      name: name.trim(),
      date,
      startTime,
      endTime,
      location: location.trim(),
      description: description.trim() || undefined,
      djs,
      staff: selectedStaff,
      flyerUri: undefined,
    });
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setDescription("");
    setDjInput("");
    setDjs([]);
    setSelectedStaff([]);
    setFlyerNote("");
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
              placeholder="z.B. Hochzeitsfeier Müller"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            />

            {/* Date */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Datum * (YYYY-MM-DD)
            </Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-04-15"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: isDateValid || date.length === 0 ? colors.border : colors.destructive, fontFamily: "Inter_400Regular" }]}
            />

            {/* Times */}
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Beginn * (HH:MM)
                </Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="18:00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Ende * (HH:MM)
                </Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="00:00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
                />
              </View>
            </View>

            {/* Location */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Ort / Raum *
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="z.B. Großer Saal"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            />

            {/* Description */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Beschreibung (optional)
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
                    <Text style={[styles.tagText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                      {dj}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveDj(dj)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Feather name="x" size={13} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Staff */}
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Personal
            </Text>
            <View style={styles.staffList}>
              {STAFF_SUGGESTIONS.map((member) => {
                const isSelected = selectedStaff.some((s) => s.id === member.id);
                return (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => toggleStaff(member)}
                    activeOpacity={0.7}
                    style={[
                      styles.staffItem,
                      {
                        backgroundColor: isSelected ? colors.primary + "18" : colors.muted,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.staffItemLeft}>
                      <View style={[styles.staffAvatar, { backgroundColor: isSelected ? colors.primary + "30" : colors.border }]}>
                        <Feather name="user" size={13} color={isSelected ? colors.primary : colors.mutedForeground} />
                      </View>
                      <View>
                        <Text style={[styles.staffName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                          {member.name}
                        </Text>
                        <Text style={[styles.staffRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {member.role}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Feather name="check" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Flyer info box */}
            <View style={[styles.flyerBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="image" size={15} color={colors.mutedForeground} />
              <Text style={[styles.flyerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Flyer kann nach dem Erstellen in den Event-Details hochgeladen werden.
              </Text>
            </View>
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
  body: { flex: 1, padding: 16 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  djInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
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
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
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
  staffList: { gap: 8 },
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  staffItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  staffAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  staffName: { fontSize: 14 },
  staffRole: { fontSize: 12 },
  flyerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  flyerText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
