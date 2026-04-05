import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { useFeed } from "@/context/FeedContext";
import { useAppContext } from "@/context/AppContext";
import type { Comment } from "@/types";

interface CommentsModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  if (hours < 24) return `vor ${hours}h`;
  if (days === 1) return "Gestern";
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function CommentItem({ comment, colors }: { comment: Comment; colors: any }) {
  return (
    <View style={styles.commentItem}>
      <Avatar name={comment.author.name} size={36} />
      <View style={styles.commentBody}>
        <View
          style={[styles.commentBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.commentHeader}>
            <Text
              style={[
                styles.commentAuthor,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {comment.author.name}
            </Text>
          </View>
          <Text
            style={[
              styles.commentContent,
              { color: colors.foreground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {comment.content}
          </Text>
        </View>
        <Text
          style={[
            styles.commentTime,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {formatTime(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export function CommentsModal({ visible, postId, onClose }: CommentsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCommentsForPost, addComment, posts } = useFeed();
  const { user } = useAppContext();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  const comments = postId ? getCommentsForPost(postId) : [];
  const post = posts.find((p) => p.id === postId);

  const handleSend = async () => {
    if (!text.trim() || !postId) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 200));
    addComment(postId, text.trim());
    setText("");
    setSending(false);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background, paddingTop: insets.top || 16 },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Kommentare
              </Text>
              <Text
                style={[
                  styles.headerSub,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {comments.length}{" "}
                {comments.length === 1 ? "Kommentar" : "Kommentare"}
              </Text>
            </View>
            <View style={{ width: 22 }} />
          </View>

          {/* Post preview */}
          {post && (
            <View
              style={[styles.postPreview, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}
            >
              <Avatar name={post.author.name} size={28} />
              <Text
                style={[
                  styles.postPreviewText,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
                numberOfLines={2}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  {post.author.name}:{" "}
                </Text>
                {post.content}
              </Text>
            </View>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="message-circle" size={40} color={colors.mutedForeground} />
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                Noch keine Kommentare.{"\n"}Sei der Erste!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CommentItem comment={item} colors={colors} />
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              onLayout={() => {
                if (comments.length > 3) {
                  listRef.current?.scrollToEnd({ animated: false });
                }
              }}
            />
          )}

          {/* Input row */}
          <View
            style={[
              styles.inputRow,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <Avatar name={user.name} size={34} />
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                placeholder="Kommentar schreiben..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                maxLength={500}
                style={[
                  styles.input,
                  { color: colors.foreground, fontFamily: "Inter_400Regular" },
                ]}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={text.trim() ? 0.7 : 1}
                disabled={!text.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginLeft: 8 }}
                  />
                ) : (
                  <Feather
                    name="send"
                    size={20}
                    color={text.trim() ? colors.primary : colors.mutedForeground}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: {
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSub: {
    fontSize: 12,
  },
  postPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  postPreviewText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 8,
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentBubble: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  commentAuthor: {
    fontSize: 13,
  },
  commentRole: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    paddingLeft: 4,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 100,
  },
});
