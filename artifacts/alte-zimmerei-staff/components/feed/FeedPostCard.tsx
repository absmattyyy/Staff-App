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
import type { FeedPost } from "@/types";

interface FeedPostCardProps {
  post: FeedPost;
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

export function FeedPostCard({ post }: FeedPostCardProps) {
  const colors = useColors();
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.reactions.like);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (liked) {
      setLocalLikes((prev) => prev - 1);
    } else {
      setLocalLikes((prev) => prev + 1);
    }
    setLiked((prev) => !prev);
  };

  const shouldTruncate = post.content.length > 150;
  const displayContent =
    shouldTruncate && !expanded
      ? post.content.slice(0, 150) + "..."
      : post.content;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: post.isImportant
            ? colors.destructive + "40"
            : post.isPinned
            ? colors.primary + "40"
            : colors.border,
          borderRadius: 14,
        },
      ]}
    >
      {(post.isPinned || post.isImportant) && (
        <View style={styles.tagRow}>
          {post.isPinned && (
            <StatusBadge variant="pinned" size="sm" />
          )}
          {post.isImportant && (
            <StatusBadge variant="important" size="sm" />
          )}
        </View>
      )}

      <View style={styles.header}>
        <Avatar name={post.author.name} size={40} />
        <View style={styles.authorInfo}>
          <Text
            style={[
              styles.authorName,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {post.author.name}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.meta,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {post.author.role}
            </Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>
              ·
            </Text>
            <Text
              style={[
                styles.meta,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              {formatTime(post.createdAt)}
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

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={[styles.postImage, { borderRadius: 10 }]}
          resizeMode="cover"
        />
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Feather
            name={liked ? "thumbs-up" : "thumbs-up"}
            size={15}
            color={liked ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: liked ? colors.primary : colors.mutedForeground,
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            {localLikes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
          <Feather name="message-circle" size={15} color={colors.mutedForeground} />
          <Text
            style={[
              styles.actionText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {post.commentsCount}
          </Text>
        </TouchableOpacity>

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
