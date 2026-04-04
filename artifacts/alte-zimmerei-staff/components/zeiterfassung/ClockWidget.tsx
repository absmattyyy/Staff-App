import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ClockWidgetProps {
  isCheckedIn: boolean;
  checkInTime?: string;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onBreak: () => void;
  isOnBreak: boolean;
}

function formatDuration(startTimeStr: string): string {
  const start = new Date(`2026-04-04T${startTimeStr}:00`);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return "0h 0m";
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function ClockWidget({
  isCheckedIn,
  checkInTime,
  onCheckIn,
  onCheckOut,
  onBreak,
  isOnBreak,
}: ClockWidgetProps) {
  const colors = useColors();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [duration, setDuration] = useState(
    checkInTime ? formatDuration(checkInTime) : "0h 0m"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      if (isCheckedIn && checkInTime && !isOnBreak) {
        setDuration(formatDuration(checkInTime));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime, isOnBreak]);

  const handleMainAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isCheckedIn) {
      onCheckOut();
    } else {
      onCheckIn();
    }
  };

  const handleBreak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBreak();
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.clock,
          { color: colors.foreground, fontFamily: "Inter_700Bold" },
        ]}
      >
        {currentTime}
      </Text>

      {isCheckedIn && (
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isOnBreak ? colors.warning : colors.success,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: isOnBreak ? colors.warning : colors.success,
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            {isOnBreak ? "Pause" : "Eingestempelt"} · {duration}
          </Text>
        </View>
      )}

      {!isCheckedIn && (
        <Text
          style={[
            styles.idleText,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Noch nicht eingestempelt
        </Text>
      )}

      <TouchableOpacity
        onPress={handleMainAction}
        activeOpacity={0.85}
        style={[
          styles.mainButton,
          {
            backgroundColor: isCheckedIn ? colors.destructive : colors.primary,
          },
        ]}
      >
        <Feather
          name={isCheckedIn ? "log-out" : "log-in"}
          size={28}
          color={isCheckedIn ? "#fff" : colors.primaryForeground}
        />
        <Text
          style={[
            styles.mainButtonLabel,
            {
              color: isCheckedIn ? "#fff" : colors.primaryForeground,
              fontFamily: "Inter_700Bold",
            },
          ]}
        >
          {isCheckedIn ? "Ausstempeln" : "Einstempeln"}
        </Text>
      </TouchableOpacity>

      {isCheckedIn && (
        <TouchableOpacity
          onPress={handleBreak}
          activeOpacity={0.8}
          style={[
            styles.breakButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              borderRadius: 12,
            },
          ]}
        >
          <Feather
            name={isOnBreak ? "play" : "coffee"}
            size={18}
            color={colors.primary}
          />
          <Text
            style={[
              styles.breakLabel,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {isOnBreak ? "Pause beenden" : "Pause starten"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  clock: {
    fontSize: 48,
    letterSpacing: -1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  idleText: {
    fontSize: 14,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: 220,
    height: 64,
    borderRadius: 32,
    marginTop: 8,
  },
  mainButtonLabel: {
    fontSize: 18,
  },
  breakButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  breakLabel: {
    fontSize: 14,
  },
});
