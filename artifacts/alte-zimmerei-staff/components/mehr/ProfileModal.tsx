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
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
}

interface Field {
  label: string;
  key: keyof Pick<User, "firstName" | "lastName" | "email" | "phone">;
  icon: string;
  keyboard?: "default" | "email-address" | "phone-pad";
}

const FIELDS: Field[] = [
  { label: "Vorname", key: "firstName", icon: "user" },
  { label: "Nachname", key: "lastName", icon: "user" },
  { label: "E-Mail", key: "email", icon: "mail", keyboard: "email-address" },
  { label: "Telefon", key: "phone", icon: "phone", keyboard: "phone-pad" },
];

export function ProfileModal({ visible, onClose, user }: ProfileModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
  });

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
    Alert.alert("Gespeichert", "Deine Profildaten wurden aktualisiert.");
  };

  const handleCancel = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    });
    setEditing(false);
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
              onPress={editing ? handleCancel : onClose}
              activeOpacity={0.7}
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
                {editing ? "Abbrechen" : "Schließen"}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Mein Profil
            </Text>
            {editing ? (
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.7}
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary, borderRadius: 20 },
                ]}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    {
                      color: colors.primaryForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  Speichern
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                activeOpacity={0.7}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.secondary,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    {
                      color: colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  Bearbeiten
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarSection}>
              <Avatar name={user.name} size={80} />
              <Text
                style={[
                  styles.userName,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_700Bold",
                  },
                ]}
              >
                {form.firstName} {form.lastName}
              </Text>
              <Text
                style={[
                  styles.userRole,
                  { color: colors.primary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {user.role}
              </Text>
            </View>

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Persönliche Daten
            </Text>

            <View
              style={[
                styles.fieldsCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              {FIELDS.map((field, idx) => (
                <View key={field.key}>
                  <View style={styles.fieldRow}>
                    <View
                      style={[
                        styles.fieldIcon,
                        {
                          backgroundColor: colors.primary + "18",
                          borderRadius: 8,
                        },
                      ]}
                    >
                      <Feather
                        name={field.icon as any}
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          {
                            color: colors.mutedForeground,
                            fontFamily: "Inter_400Regular",
                          },
                        ]}
                      >
                        {field.label}
                      </Text>
                      {editing ? (
                        <TextInput
                          value={form[field.key]}
                          onChangeText={(val) =>
                            setForm((prev) => ({ ...prev, [field.key]: val }))
                          }
                          keyboardType={field.keyboard ?? "default"}
                          autoCapitalize="none"
                          style={[
                            styles.fieldInput,
                            {
                              color: colors.foreground,
                              fontFamily: "Inter_400Regular",
                              borderBottomColor: colors.primary + "66",
                            },
                          ]}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.fieldValue,
                            {
                              color: colors.foreground,
                              fontFamily: "Inter_500Medium",
                            },
                          ]}
                        >
                          {form[field.key] || "–"}
                        </Text>
                      )}
                    </View>
                  </View>
                  {idx < FIELDS.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border, marginLeft: 50 },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <View style={styles.fieldRow}>
                <View
                  style={[
                    styles.fieldIcon,
                    {
                      backgroundColor: colors.primary + "18",
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Feather name="calendar" size={14} color={colors.primary} />
                </View>
                <View style={styles.fieldContent}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    Dabei seit
                  </Text>
                  <Text
                    style={[
                      styles.fieldValue,
                      {
                        color: colors.foreground,
                        fontFamily: "Inter_500Medium",
                      },
                    ]}
                  >
                    {new Date(user.joinedAt).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>
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
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14 },
  body: { flex: 1, padding: 16 },
  avatarSection: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 20,
  },
  userName: { fontSize: 22, marginTop: 8 },
  userRole: { fontSize: 15 },
  userDept: { fontSize: 13 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  fieldsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 16,
  },
  infoCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContent: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 12 },
  fieldValue: { fontSize: 15 },
  fieldInput: {
    fontSize: 15,
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  divider: { height: StyleSheet.hairlineWidth },
});
