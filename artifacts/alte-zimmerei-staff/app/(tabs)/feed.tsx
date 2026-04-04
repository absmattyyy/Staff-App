import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { mockFeedPosts } from "@/data/mockFeed";
import type { FeedPost } from "@/types";

type FeedTab = "news" | "general";

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FeedTab>("news");

  const filtered = mockFeedPosts.filter((p) => {
    if (activeTab === "news") return p.category === "news";
    return p.category === "general";
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
          Feed
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Feather name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.segmentWrapper,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <SegmentControl
          options={[
            { label: "News", value: "news" as FeedTab },
            { label: "Allgemein", value: "general" as FeedTab },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPostCard post={item} />}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: bottomPad + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sorted.length > 0}
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
  segmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    padding: 16,
  },
});
