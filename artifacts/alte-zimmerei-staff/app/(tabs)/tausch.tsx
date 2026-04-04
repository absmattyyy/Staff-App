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
import { ShiftCalendarStrip } from "@/components/tausch/ShiftCalendarStrip";
import { NewSwapRequestModal } from "@/components/tausch/NewSwapRequestModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSwaps } from "@/context/SwapContext";
import { useDienstplan } from "@/context/DienstplanContext";
import type { Shift } from "@/types";

export default function TauschScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { swaps, addSwapRequest, offerTakeOver, approveSwap, rejectSwap } =
    useSwaps();
  const { shifts, transferShift } = useDienstplan();

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [modalVisible, setModalVisible] = useState(false);
  const [preselectedShift, setPreselectedShift] = useState<Shift | null>(null);

  const myShifts = shifts.filter((s) => s.isOwn);

  const alreadyRequestedShiftIds = new Set(
    swaps
      .filter((s) => s.isOwn && (s.status === "open" || s.status === "pending"))
      .map((s) => s.shift.id)
  );

  const mySwaps = swaps.filter((s) => s.isOwn);
  const openSwaps = swaps.filter((s) => !s.isOwn && s.status === "open");
  const inProgressSwaps = swaps.filter(
    (s) => !s.isOwn && s.status === "pending"
  );

  const handleOpenModal = (shift?: Shift) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreselectedShift(shift ?? null);
    setModalVisible(true);
  };

  const handleSubmitRequest = (shift: Shift, note?: string) => {
    addSwapRequest(shift, note);
  };

  const handleTakeOver = (id: string) => {
    Alert.alert(
      "Schicht übernehmen",
      "Möchtest du diese Schicht wirklich übernehmen? Die Anfrage geht zur Genehmigung an den Besitzer.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Übernehmen",
          onPress: () => {
            offerTakeOver(id);
          },
        },
      ]
    );
  };

  const handleApprove = (id: string) => {
    Alert.alert(
      "Tausch genehmigen",
      "Möchtest du diesen Schichttausch genehmigen? Der Dienstplan wird automatisch aktualisiert.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Genehmigen",
          onPress: () => {
            const transferredShift = approveSwap(id);
            if (transferredShift) {
              transferShift(transferredShift.id);
            }
          },
        },
      ]
    );
  };

  const handleReject = (id: string) => {
    Alert.alert(
      "Tausch ablehnen",
      "Möchtest du diesen Schichttausch wirklich ablehnen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Ablehnen",
          style: "destructive",
          onPress: () => rejectSwap(id),
        },
      ]
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
          onPress={() => handleOpenModal()}
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
          title="Meine Schichten – April 2026"
          style={styles.sectionHeader}
        />
        <Text
          style={[
            styles.stripHint,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Tippe auf eine Schicht um eine Tausch-Anfrage zu stellen
        </Text>
        <ShiftCalendarStrip
          shifts={myShifts}
          onShiftPress={handleOpenModal}
          alreadyRequestedShiftIds={alreadyRequestedShiftIds}
        />

        <SectionHeader
          title="Meine Tauschanfragen"
          style={[styles.sectionHeader, { marginTop: 24 }]}
        />

        {mySwaps.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.card,
                borderRadius: 12,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="repeat" size={26} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Keine aktiven Tauschanfragen
            </Text>
          </View>
        ) : (
          mySwaps.map((swap) => (
            <SwapCard
              key={swap.id}
              swap={swap}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}

        <SectionHeader
          title="Offene Anfragen"
          style={[styles.sectionHeader, { marginTop: 20 }]}
        />

        {openSwaps.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.card,
                borderRadius: 12,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="inbox" size={26} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
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

        {inProgressSwaps.length > 0 && (
          <>
            <SectionHeader
              title="In Bearbeitung"
              style={[styles.sectionHeader, { marginTop: 20 }]}
            />
            {inProgressSwaps.map((swap) => (
              <SwapCard key={swap.id} swap={swap} />
            ))}
          </>
        )}
      </ScrollView>

      <NewSwapRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitRequest}
        availableShifts={myShifts}
        preselectedShift={preselectedShift}
      />
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
    marginBottom: 8,
  },
  stripHint: {
    fontSize: 12,
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
