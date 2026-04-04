import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ListItemProps {
  label: string;
  sublabel?: string;
  icon?: string;
  iconColor?: string;
  badge?: number;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  style?: ViewStyle;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function ListItem({
  label,
  sublabel,
  icon,
  iconColor,
  badge,
  onPress,
  showChevron = true,
  danger = false,
  style,
  left,
  right,
}: ListItemProps) {
  const colors = useColors();
  const color = danger ? colors.destructive : iconColor ?? colors.primary;
  const textColor = danger ? colors.destructive : colors.foreground;

  const inner = (
    <View style={[styles.row, style]}>
      {left ?? (
        icon && (
          <View
            style={[
              styles.iconBox,
              { backgroundColor: color + "18", borderRadius: 10 },
            ]}
          >
            <Feather name={icon as any} size={18} color={color} />
          </View>
        )
      )}
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: textColor, fontFamily: "Inter_500Medium" }]}>
          {label}
        </Text>
        {sublabel && (
          <Text
            style={[
              styles.sublabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {sublabel}
          </Text>
        )}
      </View>
      <View style={styles.rightSide}>
        {right}
        {badge !== undefined && badge > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
        {showChevron && onPress && (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
  },
  sublabel: {
    fontSize: 13,
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#111111",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
});
