import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({
  children,
  style,
  elevated = false,
  noPadding = false,
}: CardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          borderColor: colors.border,
          borderRadius: 12,
        },
        noPadding ? {} : styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  padding: {
    padding: 16,
  },
});
