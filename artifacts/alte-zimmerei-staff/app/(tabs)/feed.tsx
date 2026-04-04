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
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { CommentsModal } from "@/components/feed/CommentsModal";
import { useFeed } from "@/context/FeedContext";

type FeedTab = "news" | "general";

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts } = useFeed();

  const [activeTab, setActiveTab] = useState<FeedTab>("news");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  const filtered = posts.filter((p) =>
    activeTab === "news" ? p.category === "news" : p.category === "general"
  );

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <TouchableOpacity
          onPress={() => setShowCreatePost(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Segment */}
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

      {/* Post list */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedPostCard
            post={item}
            onOpenComments={(postId) => setCommentsPostId(postId)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Keine Beiträge vorhanden
            </Text>
          </View>
        }
      />

      {/* Modals */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
      <CommentsModal
        visible={commentsPostId !== null}
        postId={commentsPostId}
        onClose={() => setCommentsPostId(null)}
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
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
