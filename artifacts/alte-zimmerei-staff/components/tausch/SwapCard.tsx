import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { SwapRequest } from "@/types";

interface SwapCardProps {
  swap: SwapRequest;
  onTakeOver?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SwapCard({
  swap,
  onTakeOver,
  onApprove,
  onReject,
}: SwapCardProps) {
  const colors = useColors();

  const handleTakeOver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTakeOver?.(swap.id);
  };

  const handleApprove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApprove?.(swap.id);
  };

  const handleReject = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onReject?.(swap.id);
  };

  const isActive = swap.status === "open" || swap.status === "pending";
  const showOwnerApproval = swap.isOwn && swap.status === "pending";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor:
            swap.status === "approved"
              ? colors.success + "44"
              : swap.status === "rejected"
              ? colors.destructive + "33"
              : swap.status === "pending" && swap.isOwn
              ? colors.warning + "55"
              : colors.border,
          borderRadius: 12,
          opacity: swap.status === "rejected" ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Avatar name={swap.requestedBy.name} size={36} />
        <View style={styles.headerInfo}>
          <Text
            style={[
              styles.name,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {swap.requestedBy.name}
          </Text>
          <Text
            style={[
              styles.meta,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {new Date(swap.createdAt).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
        <StatusBadge variant={swap.status} size="sm" />
      </View>

      <View
        style={[
          styles.shiftInfo,
          {
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.shiftRow}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text
            style={[
              styles.shiftText,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {formatDate(swap.shift.date)}
          </Text>
        </View>
        <View style={styles.shiftRow}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.shiftText,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {swap.shift.startTime} – {swap.shift.endTime}
          </Text>
        </View>
        <View style={styles.shiftRow}>
          <Feather name="briefcase" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.shiftText,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
            numberOfLines={1}
          >
            {swap.shift.eventName} · {swap.shift.location}
          </Text>
        </View>
        <View style={styles.shiftRow}>
          <Feather name="user" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.shiftText,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {swap.shift.role}
          </Text>
        </View>
      </View>

      {swap.note && (
        <Text
          style={[
            styles.note,
            {
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              backgroundColor: colors.muted,
              borderRadius: 8,
            },
          ]}
        >
          {swap.note}
        </Text>
      )}

      {showOwnerApproval && (
        <View
          style={[
            styles.approvalBox,
            {
              backgroundColor: colors.warning + "15",
              borderColor: colors.warning + "44",
              borderRadius: 10,
            },
          ]}
        >
          <View style={styles.approvalInfo}>
            <Feather name="user-check" size={14} color={colors.warning} />
            <Text
              style={[
                styles.approvalText,
                { color: colors.warning, fontFamily: "Inter_500Medium" },
              ]}
            >
              Ein Kollege bietet Übernahme an – warte auf Besitzer-Genehmigung
            </Text>
          </View>
          <View style={styles.approvalBtns}>
            <TouchableOpacity
              onPress={handleApprove}
              activeOpacity={0.8}
              style={[
                styles.approveBtn,
                {
                  backgroundColor: colors.success + "20",
                  borderColor: colors.success + "55",
                  borderRadius: 8,
                },
              ]}
            >
              <Feather name="check" size={14} color={colors.success} />
              <Text
                style={[
                  styles.approveBtnText,
                  { color: colors.success, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Genehmigen
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReject}
              activeOpacity={0.8}
              style={[
                styles.rejectBtn,
                {
                  backgroundColor: colors.destructive + "15",
                  borderColor: colors.destructive + "44",
                  borderRadius: 8,
                },
              ]}
            >
              <Feather name="x" size={14} color={colors.destructive} />
              <Text
                style={[
                  styles.rejectBtnText,
                  {
                    color: colors.destructive,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                Ablehnen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!swap.isOwn && swap.status === "open" && onTakeOver && (
        <PrimaryButton
          label="Schicht übernehmen"
          onPress={handleTakeOver}
          size="sm"
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
  },
  shiftInfo: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftText: {
    fontSize: 13,
    flex: 1,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
  },
  approvalBox: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  approvalInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  approvalText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  approvalBtns: {
    flexDirection: "row",
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
  },
  approveBtnText: {
    fontSize: 13,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
  },
  rejectBtnText: {
    fontSize: 13,
  },
});
