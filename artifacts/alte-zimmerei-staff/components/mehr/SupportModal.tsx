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

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { key: "question", label: "Frage", icon: "help-circle" },
  { key: "bug", label: "Fehler melden", icon: "alert-circle" },
  { key: "suggestion", label: "Verbesserung", icon: "star" },
  { key: "other", label: "Sonstiges", icon: "message-square" },
];

export function SupportModal({ visible, onClose }: SupportModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const canSubmit = selectedCategory !== null && message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Danke für dein Feedback!",
      "Wir haben deine Nachricht erhalten und melden uns so schnell wie möglich.",
      [
        {
          text: "OK",
          onPress: () => {
            setSelectedCategory(null);
            setMessage("");
            onClose();
          },
        },
      ]
    );
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
              Support & Feedback
            </Text>
            <View style={{ minWidth: 80 }} />
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              Kategorie
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  activeOpacity={0.75}
                  style={[
                    styles.catCard,
                    {
                      backgroundColor:
                        selectedCategory === cat.key
                          ? colors.primary + "20"
                          : colors.card,
                      borderColor:
                        selectedCategory === cat.key
                          ? colors.primary
                          : colors.border,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Feather
                    name={cat.icon as any}
                    size={20}
                    color={
                      selectedCategory === cat.key
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.catLabel,
                      {
                        color:
                          selectedCategory === cat.key
                            ? colors.primary
                            : colors.foreground,
                        fontFamily:
                          selectedCategory === cat.key
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  marginTop: 20,
                },
              ]}
            >
              Deine Nachricht
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Beschreibe dein Anliegen so genau wie möglich..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[
                styles.messageInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.muted,
                  borderColor:
                    message.length > 0
                      ? colors.primary + "66"
                      : colors.border,
                  fontFamily: "Inter_400Regular",
                  borderRadius: 12,
                },
              ]}
            />
            <Text
              style={[
                styles.charCount,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {message.length} Zeichen
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.8 : 1}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: canSubmit ? colors.primary : colors.muted,
                  borderRadius: 12,
                  opacity: canSubmit ? 1 : 0.5,
                },
              ]}
            >
              <Feather
                name="send"
                size={16}
                color={
                  canSubmit ? colors.primaryForeground : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.submitBtnText,
                  {
                    color: canSubmit
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                Nachricht senden
              </Text>
            </TouchableOpacity>

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
  closeText: { fontSize: 15, minWidth: 80 },
  title: { fontSize: 16 },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catCard: {
    width: "47%",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 16,
  },
  catLabel: { fontSize: 13, textAlign: "center" },
  messageInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginBottom: 20,
  },
  submitBtnText: { fontSize: 15 },
});
