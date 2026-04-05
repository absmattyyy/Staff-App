import React, { useState, useRef } from "react";
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
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { useFeed } from "@/context/FeedContext";
import { useAppContext } from "@/context/AppContext";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPost } = useFeed();
  const { user } = useAppContext();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"news" | "general">("general");
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const canPost = content.trim().length > 0;

  const handlePost = async () => {
    if (!canPost) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    addPost(content.trim(), category, user.isAdmin ? isImportant : false);
    setLoading(false);
    setContent("");
    setCategory("general");
    setIsImportant(false);
    onClose();
  };

  const handleClose = () => {
    setContent("");
    setCategory("general");
    setIsImportant(false);
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
              Neuer Beitrag
            </Text>
            <TouchableOpacity
              onPress={handlePost}
              activeOpacity={canPost ? 0.7 : 1}
              style={[
                styles.postBtn,
                {
                  backgroundColor: canPost ? colors.primary : colors.muted,
                  opacity: canPost ? 1 : 0.5,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.postBtnText,
                    {
                      color: colors.primaryForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  Posten
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Author row */}
            <View style={styles.authorRow}>
              <Avatar name={user.name} size={44} />
              <View style={styles.authorInfo}>
                <Text
                  style={[
                    styles.authorName,
                    { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {user.name}
                </Text>
              </View>
            </View>

            {/* Category selector */}
            <View style={styles.categoryRow}>
              {(["general", "news"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        category === cat
                          ? colors.primary + "20"
                          : colors.muted,
                      borderColor:
                        category === cat ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={cat === "news" ? "bell" : "message-square"}
                    size={13}
                    color={
                      category === cat ? colors.primary : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color:
                          category === cat
                            ? colors.primary
                            : colors.mutedForeground,
                        fontFamily:
                          category === cat
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                      },
                    ]}
                  >
                    {cat === "news" ? "News" : "Allgemein"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              value={content}
              onChangeText={setContent}
              placeholder="Was möchtest du mitteilen?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              autoFocus
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              maxLength={2000}
            />

            {/* Character count */}
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

            {/* Important toggle – only for admins */}
            {user.isAdmin && (
              <View
                style={[
                  styles.importantRow,
                  {
                    backgroundColor: isImportant
                      ? colors.destructive + "10"
                      : colors.muted,
                    borderColor: isImportant
                      ? colors.destructive + "40"
                      : colors.border,
                  },
                ]}
              >
                <View style={styles.importantLeft}>
                  <Feather
                    name="alert-circle"
                    size={15}
                    color={isImportant ? colors.destructive : colors.mutedForeground}
                  />
                  <View style={styles.importantTextBlock}>
                    <Text
                      style={[
                        styles.importantLabel,
                        {
                          color: isImportant
                            ? colors.destructive
                            : colors.foreground,
                          fontFamily: "Inter_500Medium",
                        },
                      ]}
                    >
                      Als wichtig markieren
                    </Text>
                    <Text
                      style={[
                        styles.importantSub,
                        { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                      ]}
                    >
                      Wird für alle Mitarbeiter hervorgehoben
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isImportant}
                  onValueChange={setIsImportant}
                  trackColor={{
                    false: colors.border,
                    true: colors.destructive,
                  }}
                  thumbColor={colors.background}
                />
              </View>
            )}

            {/* Tips */}
            <View
              style={[styles.tipBox, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text
                style={[
                  styles.tipText,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                Dein Beitrag ist für alle Mitarbeiter sichtbar.
              </Text>
            </View>
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
  postBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: {
    fontSize: 14,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontSize: 15,
  },
  authorRole: {
    fontSize: 13,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryLabel: {
    fontSize: 13,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 16,
  },
  importantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  importantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  importantTextBlock: {
    gap: 2,
    flex: 1,
  },
  importantLabel: {
    fontSize: 14,
  },
  importantSub: {
    fontSize: 12,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 40,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
