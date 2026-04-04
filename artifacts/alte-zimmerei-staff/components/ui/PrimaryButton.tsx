import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary",
  size = "md",
}: PrimaryButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.primary };
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "danger":
        return { backgroundColor: colors.destructive + "22" };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return colors.primaryForeground;
      case "danger":
        return colors.destructive;
      default:
        return colors.foreground;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 8, paddingHorizontal: 14 };
      case "lg":
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 13;
      case "lg":
        return 17;
      default:
        return 15;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getContainerStyle(),
        getPadding(),
        { borderRadius: 12, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
