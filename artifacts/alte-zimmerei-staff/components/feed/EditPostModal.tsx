import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFeed } from "@/context/FeedContext";
import type { FeedPost } from "@/types";

interface EditPostModalProps {
  post: FeedPost | null;
  onClose: () => void;
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updatePost } = useFeed();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
    }
  }, [post]);

  const canSave = content.trim().length > 0 && content.trim() !== post?.content;

  const handleSave = async () => {
    if (!canSave || !post) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    updatePost(post.id, content.trim());
    setLoading(false);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={!!post}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              style={styles.cancelBtn}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                Abbrechen
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Beitrag bearbeiten
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={canSave ? 0.7 : 1}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: canSave ? colors.primary : colors.muted,
                  opacity: canSave ? 1 : 0.5,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.saveBtnText,
                    {
                      color: colors.primaryForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  Speichern
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Beitragsinhalt…"
              placeholderTextColor={colors.mutedForeground}
              multiline
              autoFocus
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                },
              ]}
              maxLength={2000}
            />
            <Text
              style={[
                styles.charCount,
                {
                  color:
                    content.length > 1800
                      ? colors.destructive
                      : colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {content.length}/2000
            </Text>
          </ScrollView>
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
  cancelBtn: {
    minWidth: 80,
  },
  cancelText: {
    fontSize: 15,
  },
  title: {
    fontSize: 16,
  },
  saveBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 160,
    textAlignVertical: "top",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
  },
});
