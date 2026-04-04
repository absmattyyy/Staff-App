import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { ListItem } from "@/components/ui/ListItem";
import { Card } from "@/components/ui/Card";
import { mockMenuItems } from "@/data/mockMenu";
import { useAppContext } from "@/context/AppContext";
import { ProfileModal } from "@/components/mehr/ProfileModal";
import { NotificationsModal } from "@/components/mehr/NotificationsModal";
import { MeetingsModal } from "@/components/mehr/MeetingsModal";
import { DocumentsModal } from "@/components/mehr/DocumentsModal";
import { SettingsModal } from "@/components/mehr/SettingsModal";
import { SupportModal } from "@/components/mehr/SupportModal";
import { UnavailabilityModal } from "@/components/dienstplan/UnavailabilityModal";

export default function MehrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isCheckedIn } = useAppContext();

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [meetingsOpen, setMeetingsOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleMenuItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case "profile":
        setProfileOpen(true);
        break;
      case "notifications":
        setNotificationsOpen(true);
        break;
      case "meetings":
        setMeetingsOpen(true);
        break;
      case "availability":
        setAvailabilityOpen(true);
        break;
      case "documents":
        setDocumentsOpen(true);
        break;
      case "settings":
        setSettingsOpen(true);
        break;
      case "support":
        setSupportOpen(true);
        break;
      case "logout":
        Alert.alert(
          "Abmelden",
          "Möchtest du dich wirklich abmelden?",
          [
            { text: "Abbrechen", style: "cancel" },
            {
              text: "Abmelden",
              style: "destructive",
              onPress: () => {
                Alert.alert("Abgemeldet", "Du wurdest erfolgreich abgemeldet.");
              },
            },
          ]
        );
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Mehr
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => handleMenuItem("profile")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 16,
              },
            ]}
          >
            <Avatar name={user.name} size={64} />
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                {user.name}
              </Text>
              <Text
                style={[
                  styles.profileRole,
                  { color: colors.primary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {user.role}
              </Text>
              <Text
                style={[
                  styles.profileDept,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {user.department}
              </Text>
            </View>
            <View style={styles.profileEdit}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View
            style={[
              styles.infoChip,
              {
                backgroundColor: isCheckedIn
                  ? colors.success + "18"
                  : colors.muted,
                borderRadius: 10,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isCheckedIn
                    ? colors.success
                    : colors.mutedForeground,
                },
              ]}
            />
            <Text
              style={[
                styles.infoChipText,
                {
                  color: isCheckedIn ? colors.success : colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {isCheckedIn ? "Eingestempelt" : "Ausgestempelt"}
            </Text>
          </View>
          <View
            style={[
              styles.infoChip,
              {
                backgroundColor: colors.card,
                borderRadius: 10,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text
              style={[
                styles.infoChipText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Seit {user.joinedAt.split("-")[0]}
            </Text>
          </View>
        </View>

        {mockMenuItems.map((group, groupIdx) => (
          <Card key={groupIdx} noPadding style={styles.menuGroup}>
            {group.map((item, itemIdx) => (
              <View key={item.id}>
                <View style={styles.listItemWrapper}>
                  <ListItem
                    label={item.label}
                    sublabel={item.sublabel}
                    icon={item.icon}
                    badge={item.badge}
                    onPress={() => handleMenuItem(item.id)}
                    danger={item.danger}
                    style={{ paddingHorizontal: 14 }}
                  />
                </View>
                {itemIdx < group.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border, marginLeft: 62 },
                    ]}
                  />
                )}
              </View>
            ))}
          </Card>
        ))}

        <Text
          style={[
            styles.version,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Alte Zimmerei Staff App · v1.0.0
        </Text>
      </ScrollView>

      <ProfileModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <MeetingsModal
        visible={meetingsOpen}
        onClose={() => setMeetingsOpen(false)}
      />
      <UnavailabilityModal
        visible={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
      />
      <DocumentsModal
        visible={documentsOpen}
        onClose={() => setDocumentsOpen(false)}
      />
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <SupportModal
        visible={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 28,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
  },
  profileRole: {
    fontSize: 14,
  },
  profileDept: {
    fontSize: 13,
  },
  profileEdit: {
    padding: 4,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  infoChipText: {
    fontSize: 13,
  },
  menuGroup: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  listItemWrapper: {},
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
