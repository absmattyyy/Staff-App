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

const FAQ_ITEMS = [
  {
    q: "Wie ändere ich meinen Dienst?",
    a: "Gehe zur Tausch-Seite und erstelle eine neue Tausch-Anfrage für deinen gewünschten Dienst.",
  },
  {
    q: "Wie melde ich mich krank?",
    a: "Wende dich direkt an deinen Vorgesetzten und trage eine Abwesenheit unter Verfügbarkeiten ein.",
  },
  {
    q: "Wer sieht meine Zeiterfassung?",
    a: "Nur du und die Personalleitung haben Zugriff auf deine Zeiterfassungsdaten.",
  },
  {
    q: "Wie beantrage ich Urlaub?",
    a: "Nutze das Urlaubsantrag-Formular unter Dokumente und reiche es bei der Personalleitung ein.",
  },
];

export function SupportModal({ visible, onClose }: SupportModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"feedback" | "faq">("feedback");

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

          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            {(["feedback", "faq"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab
                          ? colors.primary
                          : colors.mutedForeground,
                      fontFamily:
                        activeTab === tab
                          ? "Inter_600SemiBold"
                          : "Inter_400Regular",
                    },
                  ]}
                >
                  {tab === "feedback" ? "Feedback senden" : "Häufige Fragen"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "feedback" ? (
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
                      message.length > 0 ? colors.primary + "66" : colors.border,
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
                  color={canSubmit ? colors.primaryForeground : colors.mutedForeground}
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

              <View
                style={[
                  styles.contactBox,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                <Feather name="mail" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.contactTitle,
                      {
                        color: colors.foreground,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    Direkter Kontakt
                  </Text>
                  <Text
                    style={[
                      styles.contactSub,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    support@alte-zimmerei.de
                  </Text>
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.body}
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
                Häufig gestellte Fragen
              </Text>
              {FAQ_ITEMS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  activeOpacity={0.75}
                  style={[
                    styles.faqCard,
                    {
                      backgroundColor: colors.card,
                      borderColor:
                        expandedFaq === idx
                          ? colors.primary + "55"
                          : colors.border,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <View style={styles.faqHeader}>
                    <Text
                      style={[
                        styles.faqQuestion,
                        {
                          color: colors.foreground,
                          fontFamily: "Inter_500Medium",
                          flex: 1,
                        },
                      ]}
                    >
                      {item.q}
                    </Text>
                    <Feather
                      name={expandedFaq === idx ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </View>
                  {expandedFaq === idx && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        {
                          color: colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                        },
                      ]}
                    >
                      {item.a}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14 },
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
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4, marginBottom: 16 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginBottom: 20,
  },
  submitBtnText: { fontSize: 15 },
  contactBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  contactTitle: { fontSize: 14 },
  contactSub: { fontSize: 13 },
  faqCard: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  faqQuestion: { fontSize: 14, lineHeight: 20 },
  faqAnswer: { fontSize: 13, lineHeight: 20 },
});
