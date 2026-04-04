import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {action && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  action: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
