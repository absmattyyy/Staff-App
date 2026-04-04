import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SwapCard } from "@/components/tausch/SwapCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { mockSwapRequests } from "@/data/mockSwaps";
import type { SwapRequest } from "@/types";

export default function TauschScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [swaps, setSwaps] = useState<SwapRequest[]>(mockSwapRequests);

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const mySwaps = swaps.filter((s) => s.isOwn);
  const openSwaps = swaps.filter((s) => !s.isOwn && s.status === "open");
  const otherActiveSwaps = swaps.filter(
    (s) => !s.isOwn && s.status === "pending"
  );

  const handleTakeOver = (id: string) => {
    Alert.alert(
      "Schicht übernehmen",
      "Möchtest du diese Schicht wirklich übernehmen? Die Anfrage geht zur Genehmigung an die Personalleitung.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Übernehmen",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSwaps((prev) =>
              prev.map((s) =>
                s.id === id ? { ...s, status: "pending" as const } : s
              )
            );
          },
        },
      ]
    );
  };

  const handleNewRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Neue Tausch-Anfrage",
      "Diese Funktion ist in der finalen Version verfügbar.",
      [{ text: "OK" }]
    );
  };

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
          Tausch
        </Text>
        <TouchableOpacity
          onPress={handleNewRequest}
          activeOpacity={0.8}
          style={[
            styles.newRequestBtn,
            { backgroundColor: colors.primary, borderRadius: 20 },
          ]}
        >
          <Feather name="plus" size={16} color={colors.primaryForeground} />
          <Text
            style={[
              styles.newRequestLabel,
              {
                color: colors.primaryForeground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            Neue Anfrage
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title="Meine Tauschanfragen"
          style={styles.sectionHeader}
        />

        {mySwaps.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.card, borderRadius: 12, borderColor: colors.border },
            ]}
          >
            <Feather name="repeat" size={26} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Keine aktiven Tauschanfragen
            </Text>
          </View>
        ) : (
          mySwaps.map((swap) => <SwapCard key={swap.id} swap={swap} />)
        )}

        <SectionHeader
          title="Offene Anfragen"
          style={[styles.sectionHeader, { marginTop: 20 }]}
        />

        {openSwaps.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.card, borderRadius: 12, borderColor: colors.border },
            ]}
          >
            <Feather name="inbox" size={26} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Keine offenen Anfragen vorhanden
            </Text>
          </View>
        ) : (
          openSwaps.map((swap) => (
            <SwapCard key={swap.id} swap={swap} onTakeOver={handleTakeOver} />
          ))
        )}

        {otherActiveSwaps.length > 0 && (
          <>
            <SectionHeader
              title="In Bearbeitung"
              style={[styles.sectionHeader, { marginTop: 20 }]}
            />
            {otherActiveSwaps.map((swap) => (
              <SwapCard key={swap.id} swap={swap} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 28,
  },
  newRequestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newRequestLabel: {
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
});
