import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useFeed } from "@/context/FeedContext";
import type { FeedPost } from "@/types";

interface FeedPostCardProps {
  post: FeedPost;
  onOpenComments: (postId: string) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (hours < 1) return "Gerade eben";
  if (hours < 24) return `vor ${hours}h`;
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function FeedPostCard({ post, onOpenComments }: FeedPostCardProps) {
  const colors = useColors();
  const { toggleLike, likedPostIds, posts } = useFeed();
  const [expanded, setExpanded] = useState(false);

  const livePost = posts.find((p) => p.id === post.id) ?? post;
  const liked = likedPostIds.has(post.id);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(post.id);
  };

  const handleComment = () => {
    onOpenComments(post.id);
  };

  const shouldTruncate = livePost.content.length > 150;
  const displayContent =
    shouldTruncate && !expanded
      ? livePost.content.slice(0, 150) + "..."
      : livePost.content;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: livePost.isImportant
            ? colors.destructive + "40"
            : livePost.isPinned
            ? colors.primary + "40"
            : colors.border,
          borderRadius: 14,
        },
      ]}
    >
      {(livePost.isPinned || livePost.isImportant) && (
        <View style={styles.tagRow}>
          {livePost.isPinned && <StatusBadge variant="pinned" size="sm" />}
          {livePost.isImportant && <StatusBadge variant="important" size="sm" />}
        </View>
      )}

      <View style={styles.header}>
        <Avatar name={livePost.author.name} size={40} />
        <View style={styles.authorInfo}>
          <Text
            style={[
              styles.authorName,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {livePost.author.name}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.meta,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {livePost.author.role}
            </Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
            <Text
              style={[
                styles.meta,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {formatTime(livePost.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.content,
          { color: colors.foreground, fontFamily: "Inter_400Regular" },
        ]}
      >
        {displayContent}
      </Text>

      {shouldTruncate && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text
            style={[
              styles.moreBtn,
              { color: colors.primary, fontFamily: "Inter_500Medium" },
            ]}
          >
            {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
          </Text>
        </TouchableOpacity>
      )}

      {livePost.image && (
        <Image
          source={{ uri: livePost.image }}
          style={[styles.postImage, { borderRadius: 10 }]}
          resizeMode="cover"
        />
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Feather
            name="thumbs-up"
            size={15}
            color={liked ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: liked ? colors.primary : colors.mutedForeground,
                fontFamily: liked ? "Inter_600SemiBold" : "Inter_400Regular",
              },
            ]}
          >
            {livePost.reactions.like}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity
          onPress={handleComment}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Feather name="message-circle" size={15} color={colors.mutedForeground} />
          <Text
            style={[
              styles.actionText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {livePost.commentsCount}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
          <Feather name="share" size={15} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  meta: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  moreBtn: {
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 180,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionText: {
    fontSize: 13,
  },
});
