import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface DocumentsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: "vertrag" | "abrechnung" | "formular" | "richtlinie";
  icon: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "d1",
    name: "Arbeitsvertrag",
    type: "PDF",
    size: "248 KB",
    date: "15. März 2021",
    category: "vertrag",
    icon: "file-text",
  },
  {
    id: "d2",
    name: "Lohnabrechnung März 2026",
    type: "PDF",
    size: "128 KB",
    date: "1. Apr. 2026",
    category: "abrechnung",
    icon: "dollar-sign",
  },
  {
    id: "d3",
    name: "Lohnabrechnung Februar 2026",
    type: "PDF",
    size: "125 KB",
    date: "1. März 2026",
    category: "abrechnung",
    icon: "dollar-sign",
  },
  {
    id: "d4",
    name: "Urlaubsantrag Formular",
    type: "PDF",
    size: "64 KB",
    date: "10. Jan. 2026",
    category: "formular",
    icon: "calendar",
  },
  {
    id: "d5",
    name: "Überstundennachweis",
    type: "PDF",
    size: "92 KB",
    date: "3. Apr. 2026",
    category: "formular",
    icon: "clock",
  },
  {
    id: "d6",
    name: "Hausordnung",
    type: "PDF",
    size: "180 KB",
    date: "1. Jan. 2026",
    category: "richtlinie",
    icon: "home",
  },
  {
    id: "d7",
    name: "Hygienerichtlinien",
    type: "PDF",
    size: "156 KB",
    date: "1. Jan. 2026",
    category: "richtlinie",
    icon: "shield",
  },
];

const CATEGORY_COLORS: Record<Document["category"], string> = {
  vertrag: "#0A84FF",
  abrechnung: "#30D158",
  formular: "#FF9F0A",
  richtlinie: "#BF5AF2",
};

const CATEGORY_LABELS: Record<Document["category"], string> = {
  vertrag: "Vertrag",
  abrechnung: "Abrechnung",
  formular: "Formular",
  richtlinie: "Richtlinie",
};

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "abrechnung", label: "Abrechnungen" },
  { key: "vertrag", label: "Verträge" },
  { key: "formular", label: "Formulare" },
  { key: "richtlinie", label: "Richtlinien" },
] as const;

export function DocumentsModal({ visible, onClose }: DocumentsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all"
      ? MOCK_DOCUMENTS
      : MOCK_DOCUMENTS.filter((d) => d.category === activeFilter);

  const handleDownload = (doc: Document) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Dokument öffnen",
      `"${doc.name}" wird geladen...`,
      [{ text: "OK" }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
            Dokumente
          </Text>
          <View style={{ minWidth: 80 }} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === f.key
                      ? colors.primary
                      : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      activeFilter === f.key
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                    fontFamily:
                      activeFilter === f.key
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.countLabel,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {filtered.length} Dokument{filtered.length !== 1 ? "e" : ""}
          </Text>

          {filtered.map((doc) => {
            const catColor = CATEGORY_COLORS[doc.category];
            return (
              <View
                key={doc.id}
                style={[
                  styles.docCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                <View
                  style={[
                    styles.docIcon,
                    { backgroundColor: catColor + "20", borderRadius: 10 },
                  ]}
                >
                  <Feather
                    name={doc.icon as any}
                    size={20}
                    color={catColor}
                  />
                </View>
                <View style={styles.docInfo}>
                  <Text
                    style={[
                      styles.docName,
                      {
                        color: colors.foreground,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    {doc.name}
                  </Text>
                  <View style={styles.docMeta}>
                    <View
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor: catColor + "18",
                          borderRadius: 6,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catText,
                          { color: catColor, fontFamily: "Inter_500Medium" },
                        ]}
                      >
                        {CATEGORY_LABELS[doc.category]}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.docSize,
                        {
                          color: colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                        },
                      ]}
                    >
                      {doc.type} · {doc.size}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.docDate,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    {doc.date}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDownload(doc)}
                  activeOpacity={0.7}
                  style={[
                    styles.downloadBtn,
                    {
                      backgroundColor: colors.muted,
                      borderRadius: 8,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather
                    name="download"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
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
  closeText: { fontSize: 15, minWidth: 80 },
  title: { fontSize: 16 },
  filterScroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterText: { fontSize: 13 },
  body: { flex: 1, padding: 16 },
  countLabel: { fontSize: 12, marginBottom: 10 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: { flex: 1, gap: 4 },
  docName: { fontSize: 14 },
  docMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  catText: { fontSize: 11 },
  docSize: { fontSize: 12 },
  docDate: { fontSize: 12 },
  downloadBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
