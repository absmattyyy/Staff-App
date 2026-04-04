import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface SegmentControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentControlProps<T>) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.muted, borderRadius: 10 },
        style,
      ]}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={[
              styles.option,
              { borderRadius: 8 },
              isActive && { backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.foreground : colors.mutedForeground,
                  fontFamily: isActive
                    ? "Inter_600SemiBold"
                    : "Inter_400Regular",
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
});
