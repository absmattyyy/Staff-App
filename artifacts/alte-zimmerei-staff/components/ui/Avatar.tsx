import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  size?: number;
  imageUri?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string, primary: string): string {
  const palette = [
    "#E89F3F",
    "#30D158",
    "#0A84FF",
    "#FF6B6B",
    "#AF52DE",
    "#FF9F0A",
    "#32ADE6",
    "#FF2D55",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length] ?? primary;
}

export function Avatar({ name, size = 40, imageUri }: AvatarProps) {
  const colors = useColors();
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name, colors.primary);

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor + "33",
          borderColor: bgColor + "66",
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: bgColor,
            fontSize: size * 0.36,
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  initials: {
    letterSpacing: 0.5,
  },
  image: {
    resizeMode: "cover",
  },
});
