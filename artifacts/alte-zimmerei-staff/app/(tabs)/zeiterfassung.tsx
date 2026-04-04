import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { ClockWidget } from "@/components/zeiterfassung/ClockWidget";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockTimeRecords, monthlyStats } from "@/data/mockTimeRecords";
import type { BookingType } from "@/types";

const BOOKING_LABELS: Partial<Record<BookingType, string>> = {
  checkin: "Einstempeln",
  checkout: "Ausstempeln",
};

const BOOKING_ICONS: Partial<Record<BookingType, string>> = {
  checkin: "log-in",
  checkout: "log-out",
};

const BOOKING_COLORS: Record<string, string> = {
  checkin: "#30D158",
  checkout: "#FF453A",
};

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ZeiterfassungScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isCheckedIn, checkInTime, checkIn, checkOut } = useAppContext();

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleCheckOut = () => {
    Alert.alert(
      "Ausstempeln",
      "Möchtest du jetzt ausstempeln?",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Ausstempeln", style: "destructive", onPress: checkOut },
      ]
    );
  };

  const recentRecords = mockTimeRecords.slice(1).map((record) => ({
    ...record,
    bookings: record.bookings.filter(
      (b) => b.type !== "break_start" && b.type !== "break_end"
    ),
  }));

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
          Zeiterfassung
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.clockCard}>
          <ClockWidget
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            onCheckIn={checkIn}
            onCheckOut={handleCheckOut}
          />
        </Card>

        <Card style={styles.statsCard}>
          <SectionHeader title="April 2026" style={{ marginBottom: 12 }} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                {monthlyStats.workedHours}h
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                Gearbeitet
              </Text>
            </View>
          </View>
        </Card>

        <SectionHeader title="Letzte Buchungen" style={styles.sectionHeader} />

        {recentRecords.map((record) => (
          <Card key={record.date} noPadding style={{ marginBottom: 10 }}>
            <View
              style={[
                styles.dateHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {formatDate(record.date)}
              </Text>
              {record.totalMinutes && (
                <Text
                  style={[
                    styles.totalTime,
                    { color: colors.primary, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {formatMinutes(record.totalMinutes - (record.breakMinutes ?? 0))}
                </Text>
              )}
            </View>

            {record.bookings.map((booking, idx) => (
              <View
                key={booking.id}
                style={[
                  styles.bookingRow,
                  idx < record.bookings.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View
                  style={[
                    styles.bookingIcon,
                    {
                      backgroundColor:
                        (BOOKING_COLORS[booking.type] ?? colors.muted) + "22",
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Feather
                    name={BOOKING_ICONS[booking.type] as any}
                    size={14}
                    color={BOOKING_COLORS[booking.type] ?? colors.mutedForeground}
                  />
                </View>
                <Text
                  style={[
                    styles.bookingLabel,
                    { color: colors.foreground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {BOOKING_LABELS[booking.type]}
                </Text>
                <Text
                  style={[
                    styles.bookingTime,
                    { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {booking.time}
                </Text>
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>
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
    gap: 0,
  },
  clockCard: {
    marginBottom: 14,
    padding: 24,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateText: {
    fontSize: 14,
  },
  totalTime: {
    fontSize: 14,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bookingIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingLabel: {
    flex: 1,
    fontSize: 14,
  },
  bookingTime: {
    fontSize: 14,
  },
});
