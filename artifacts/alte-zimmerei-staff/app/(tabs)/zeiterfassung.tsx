import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/constants/api";
import { ClockWidget } from "@/components/zeiterfassung/ClockWidget";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { BookingType, TimeRecord } from "@/types";

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

function computeWorkedMinutes(records: TimeRecord[]): number {
  let total = 0;
  for (const record of records) {
    const bookings = record.bookings;
    let checkinTime: string | null = null;
    let breakStart: string | null = null;
    let breakMinutes = 0;
    for (const b of bookings) {
      if (b.type === "checkin") checkinTime = b.time;
      if (b.type === "break_start") breakStart = b.time;
      if (b.type === "break_end" && breakStart) {
        const [bsh, bsm] = breakStart.split(":").map(Number);
        const [beh, bem] = b.time.split(":").map(Number);
        breakMinutes += (beh * 60 + bem) - (bsh * 60 + bsm);
        breakStart = null;
      }
      if (b.type === "checkout" && checkinTime) {
        const [cih, cim] = checkinTime.split(":").map(Number);
        const [coh, com] = b.time.split(":").map(Number);
        total += (coh * 60 + com) - (cih * 60 + cim) - breakMinutes;
        breakMinutes = 0;
      }
    }
  }
  return total;
}

export default function ZeiterfassungScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { isCheckedIn, checkInTime, checkIn, checkOut } = useAppContext();
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [workedHours, setWorkedHours] = useState(0);

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const loadRecords = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch(`/time-records?month=${currentMonth}`, { token });
      if (res.ok) {
        const data: TimeRecord[] = await res.json();
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
        setTimeRecords(sorted);
        const minutes = computeWorkedMinutes(data);
        setWorkedHours(Math.round((minutes / 60) * 10) / 10);
      }
    } catch {}
  }, [token, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const handleCheckOut = () => {
    Alert.alert(
      "Ausstempeln",
      "Möchtest du jetzt ausstempeln?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Ausstempeln",
          style: "destructive",
          onPress: async () => {
            await checkOut();
            loadRecords();
          },
        },
      ]
    );
  };

  const handleCheckIn = async () => {
    await checkIn();
    loadRecords();
  };

  const recentRecords = timeRecords.slice(1).map((record) => ({
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
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </Card>

        <Card style={styles.statsCard}>
          <SectionHeader title={monthLabel} style={{ marginBottom: 12 }} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                {workedHours}h
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

        {recentRecords.length > 0 && (
          <>
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
          </>
        )}
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
