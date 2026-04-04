import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [showWeekends, setShowWeekends] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [language, setLanguage] = useState("Deutsch");

  const handleClearCache = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Cache leeren",
      "Möchtest du den App-Cache wirklich leeren?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Leeren",
          onPress: () => Alert.alert("Fertig", "Cache wurde geleert."),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Konto löschen",
      "Diese Aktion kann nicht rückgängig gemacht werden. Wende dich an deinen Arbeitgeber.",
      [{ text: "Verstanden" }]
    );
  };

  const TOGGLE_GROUPS = [
    {
      title: "Sound & Haptik",
      items: [
        {
          label: "Benachrichtigungston",
          sub: "Ton bei neuen Nachrichten",
          value: sound,
          onChange: setSound,
          icon: "volume-2",
        },
        {
          label: "Vibration",
          sub: "Haptisches Feedback",
          value: vibration,
          onChange: setVibration,
          icon: "zap",
        },
      ],
    },
    {
      title: "Dienstplan",
      items: [
        {
          label: "Wochenenden anzeigen",
          sub: "Sa & So im Kalender einblenden",
          value: showWeekends,
          onChange: setShowWeekends,
          icon: "calendar",
        },
        {
          label: "Kompakte Ansicht",
          sub: "Weniger Details pro Schicht",
          value: compactView,
          onChange: setCompactView,
          icon: "layout",
        },
      ],
    },
    {
      title: "Zeiterfassung",
      items: [
        {
          label: "Auto-Einstempeln",
          sub: "Beim Betreten des Standorts",
          value: autoCheckIn,
          onChange: setAutoCheckIn,
          icon: "map-pin",
        },
      ],
    },
  ];

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
            Einstellungen
          </Text>
          <View style={{ minWidth: 80 }} />
        </View>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {TOGGLE_GROUPS.map((group) => (
            <View key={group.title}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                {group.title}
              </Text>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                {group.items.map((item, idx, arr) => (
                  <View key={item.label}>
                    <View style={styles.toggleRow}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: colors.primary + "18",
                            borderRadius: 8,
                          },
                        ]}
                      >
                        <Feather
                          name={item.icon as any}
                          size={14}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.toggleText}>
                        <Text
                          style={[
                            styles.toggleLabel,
                            {
                              color: colors.foreground,
                              fontFamily: "Inter_500Medium",
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.toggleSub,
                            {
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                        >
                          {item.sub}
                        </Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.onChange}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor="#fff"
                      />
                    </View>
                    {idx < arr.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: colors.border, marginLeft: 58 },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Sprache & Region
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 12,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectRow}
              onPress={() =>
                Alert.alert(
                  "Sprache",
                  "Weitere Sprachen werden in Kürze verfügbar sein.",
                  [{ text: "OK" }]
                )
              }
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.primary + "18",
                    borderRadius: 8,
                  },
                ]}
              >
                <Feather name="globe" size={14} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                    flex: 1,
                  },
                ]}
              >
                Sprache
              </Text>
              <Text
                style={[
                  styles.selectValue,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {language}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Datenverwaltung
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 12,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleClearCache}
              activeOpacity={0.7}
              style={styles.selectRow}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.primary + "18",
                    borderRadius: 8,
                  },
                ]}
              >
                <Feather name="trash-2" size={14} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                    flex: 1,
                  },
                ]}
              >
                Cache leeren
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border, marginLeft: 58 },
              ]}
            />
            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              style={styles.selectRow}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.destructive + "18",
                    borderRadius: 8,
                  },
                ]}
              >
                <Feather
                  name="user-x"
                  size={14}
                  color={colors.destructive}
                />
              </View>
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color: colors.destructive,
                    fontFamily: "Inter_500Medium",
                    flex: 1,
                  },
                ]}
              >
                Konto löschen
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.destructive}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.versionText,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            Alte Zimmerei Staff App · v1.0.0
          </Text>
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
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconBox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15 },
  toggleSub: { fontSize: 12 },
  selectValue: { fontSize: 14 },
  divider: { height: StyleSheet.hairlineWidth },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
  },
});
