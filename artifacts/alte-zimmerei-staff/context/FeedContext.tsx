import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/constants/api";
import type { FeedPost, Comment } from "@/types";

interface FeedContextValue {
  posts: FeedPost[];
  comments: Comment[];
  addPost: (content: string, category: "news" | "general", isImportant?: boolean) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  togglePin: (postId: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  likedPostIds: Set<string>;
  addComment: (postId: string, content: string) => Promise<void>;
  getCommentsForPost: (postId: string) => Comment[];
  refreshComments: (postId: string) => Promise<void>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

function mapPost(p: any): FeedPost {
  return {
    id: p.id,
    author: p.author,
    content: p.content,
    category: p.category,
    createdAt: p.createdAt,
    isPinned: p.isPinned,
    isImportant: p.isImportant,
    reactions: p.reactions || { like: 0, heart: 0, thumbsUp: 0 },
    commentsCount: p.commentsCount || 0,
    image: p.image,
  };
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);

  const likedPostIds = new Set(
    posts
      .filter((p) => p.reactions.userReacted === "like")
      .map((p) => p.id)
  );

  const loadPosts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/feed", { token });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.map(mapPost));
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const addPost = useCallback(
    async (content: string, category: "news" | "general", isImportant = false) => {
      if (!token) return;
      const res = await apiFetch("/feed", {
        method: "POST",
        body: JSON.stringify({ content, category, isImportant }),
        token,
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [mapPost(data), ...prev]);
      }
    },
    [token]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!token) return;
      const res = await apiFetch(`/feed/${postId}`, { method: "DELETE", token });
      if (res.ok || res.status === 204) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    },
    [token]
  );

  const togglePin = useCallback(
    async (postId: string) => {
      if (!token) return;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const res = await apiFetch(`/feed/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ isPinned: !post.isPinned }),
        token,
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? mapPost(data) : p))
        );
      }
    },
    [token, posts]
  );

  const updatePost = useCallback(
    async (postId: string, content: string) => {
      if (!token) return;
      const res = await apiFetch(`/feed/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
        token,
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? mapPost(data) : p))
        );
      }
    },
    [token]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!token) return;
      const res = await apiFetch(`/feed/${postId}/like`, {
        method: "POST",
        token,
      });
      if (res.ok) {
        const { liked } = await res.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const wasLiked = p.reactions.userReacted === "like";
            return {
              ...p,
              reactions: {
                ...p.reactions,
                like: liked
                  ? p.reactions.like + 1
                  : Math.max(0, p.reactions.like - 1),
                userReacted: liked ? "like" : undefined,
              },
            };
          })
        );
      }
    },
    [token]
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!token) return;
      const res = await apiFetch(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        token,
      });
      if (res.ok) {
        const data = await res.json();
        const newComment: Comment = {
          id: data.id,
          postId,
          author: data.author,
          content: data.content,
          createdAt: data.createdAt,
        };
        setAllComments((prev) => [...prev, newComment]);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
          )
        );
      }
    },
    [token]
  );

  const refreshComments = useCallback(
    async (postId: string) => {
      if (!token) return;
      try {
        const res = await apiFetch(`/feed/${postId}/comments`, { token });
        if (res.ok) {
          const data = await res.json();
          const fetched: Comment[] = data.map((c: any) => ({
            id: c.id,
            postId,
            author: c.author,
            content: c.content,
            createdAt: c.createdAt,
          }));
          setAllComments((prev) => [
            ...prev.filter((c) => c.postId !== postId),
            ...fetched,
          ]);
        }
      } catch {}
    },
    [token]
  );

  const getCommentsForPost = useCallback(
    (postId: string) => allComments.filter((c) => c.postId === postId),
    [allComments]
  );

  return (
    <FeedContext.Provider
      value={{
        posts,
        comments: allComments,
        addPost,
        deletePost,
        togglePin,
        updatePost,
        toggleLike,
        likedPostIds,
        addComment,
        getCommentsForPost,
        refreshComments,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}
