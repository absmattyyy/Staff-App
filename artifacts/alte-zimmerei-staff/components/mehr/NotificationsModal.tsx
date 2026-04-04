import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  iconColor: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Schichttausch genehmigt",
    body: "Deine Tausch-Anfrage für den 12. April wurde vom Besitzer genehmigt.",
    time: "Heute, 09:14",
    icon: "check-circle",
    iconColor: "#30D158",
    read: false,
  },
  {
    id: "n2",
    title: "Dienstplanänderung",
    body: "Deine Schicht am 10. April (Jubiläumsfeier Müller) wurde auf 16:00 Uhr geändert.",
    time: "Gestern, 18:30",
    icon: "edit",
    iconColor: "#FFD60A",
    read: false,
  },
  {
    id: "n3",
    title: "Neues Team-Meeting",
    body: "Thomas Wagner hat ein Team-Meeting für den 8. April um 09:00 Uhr eingestellt.",
    time: "3. Apr., 11:00",
    icon: "users",
    iconColor: "#0A84FF",
    read: false,
  },
  {
    id: "n4",
    title: "Neue Tausch-Anfrage",
    body: "Peter Schulz sucht jemanden für seinen Dienst am 9. April (Geburtstag Kleber).",
    time: "2. Apr., 12:05",
    icon: "repeat",
    iconColor: "#FF9F0A",
    read: true,
  },
  {
    id: "n5",
    title: "Fehlzeitenantrag",
    body: "Dein Antrag für den 15. April wurde erfolgreich übermittelt.",
    time: "1. Apr., 08:45",
    icon: "calendar",
    iconColor: "#BF5AF2",
    read: true,
  },
];

export function NotificationsModal({
  visible,
  onClose,
}: NotificationsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [shiftReminders, setShiftReminders] = useState(true);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            Benachrichtigungen
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <Text
                style={[
                  styles.markAllText,
                  { color: colors.primary, fontFamily: "Inter_500Medium" },
                ]}
              >
                Alle lesen
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ minWidth: 70 }} />
          )}
        </View>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {unreadCount > 0 && (
            <View
              style={[
                styles.unreadBanner,
                {
                  backgroundColor: colors.primary + "15",
                  borderColor: colors.primary + "44",
                  borderRadius: 10,
                },
              ]}
            >
              <Feather name="bell" size={14} color={colors.primary} />
              <Text
                style={[
                  styles.unreadBannerText,
                  { color: colors.primary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {unreadCount} ungelesene Benachrichtigung
                {unreadCount !== 1 ? "en" : ""}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Posteingang
          </Text>

          {notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.75}
              style={[
                styles.notifCard,
                {
                  backgroundColor: notif.read ? colors.card : colors.card,
                  borderColor: notif.read ? colors.border : colors.primary + "44",
                  borderRadius: 12,
                  opacity: notif.read ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.notifIcon,
                  {
                    backgroundColor: notif.iconColor + "20",
                    borderRadius: 10,
                  },
                ]}
              >
                <Feather
                  name={notif.icon as any}
                  size={16}
                  color={notif.iconColor}
                />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text
                    style={[
                      styles.notifTitle,
                      {
                        color: colors.foreground,
                        fontFamily: notif.read
                          ? "Inter_500Medium"
                          : "Inter_600SemiBold",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {notif.title}
                  </Text>
                  {!notif.read && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.notifBody,
                    {
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {notif.body}
                </Text>
                <Text
                  style={[
                    styles.notifTime,
                    {
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    },
                  ]}
                >
                  {notif.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

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
            Einstellungen
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 12,
              },
            ]}
          >
            {[
              {
                label: "Push-Benachrichtigungen",
                sub: "Benachrichtigungen auf dem Gerät",
                value: pushEnabled,
                onChange: setPushEnabled,
              },
              {
                label: "E-Mail-Benachrichtigungen",
                sub: "Wichtige Infos per E-Mail",
                value: emailEnabled,
                onChange: setEmailEnabled,
              },
              {
                label: "Schichterinnerungen",
                sub: "2 Stunden vor Schichtbeginn",
                value: shiftReminders,
                onChange: setShiftReminders,
              },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <View style={styles.toggleRow}>
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
                      { backgroundColor: colors.border, marginLeft: 16 },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
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
  closeText: { fontSize: 15, minWidth: 70 },
  title: { fontSize: 16 },
  markAllText: { fontSize: 14, minWidth: 70, textAlign: "right" },
  body: { flex: 1, padding: 16 },
  unreadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  unreadBannerText: { fontSize: 13 },
  sectionLabel: { fontSize: 14, marginBottom: 10 },
  notifCard: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  notifIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1, gap: 4 },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifTitle: { fontSize: 14, flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11 },
  settingsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15 },
  toggleSub: { fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth },
});
