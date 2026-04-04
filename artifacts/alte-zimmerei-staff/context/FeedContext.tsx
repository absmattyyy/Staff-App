import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { mockFeedPosts } from "@/data/mockFeed";
import { mockComments } from "@/data/mockComments";
import { mockUser } from "@/data/mockUser";
import type { FeedPost, Comment } from "@/types";

interface FeedContextValue {
  posts: FeedPost[];
  comments: Comment[];
  addPost: (content: string, category: "news" | "general", isImportant?: boolean) => void;
  deletePost: (postId: string) => void;
  togglePin: (postId: string) => void;
  updatePost: (postId: string, content: string) => void;
  toggleLike: (postId: string) => void;
  likedPostIds: Set<string>;
  addComment: (postId: string, content: string) => void;
  getCommentsForPost: (postId: string) => Comment[];
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>(mockFeedPosts);
  const [allComments, setAllComments] = useState<Comment[]>(mockComments);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const addPost = useCallback(
    (content: string, category: "news" | "general", isImportant = false) => {
      const newPost: FeedPost = {
        id: `p_${Date.now()}`,
        author: {
          id: mockUser.id,
          name: mockUser.name,
          role: mockUser.role,
        },
        content,
        category,
        createdAt: new Date().toISOString(),
        isPinned: false,
        isImportant,
        reactions: { like: 0, heart: 0, thumbsUp: 0 },
        commentsCount: 0,
      };
      setPosts((prev) => [newPost, ...prev]);
    },
    []
  );

  const deletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const togglePin = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isPinned: !p.isPinned } : p
      )
    );
  }, []);

  const updatePost = useCallback((postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content } : p))
    );
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      const wasLiked = next.has(postId);
      if (wasLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                reactions: {
                  ...p.reactions,
                  like: wasLiked ? p.reactions.like - 1 : p.reactions.like + 1,
                },
              }
            : p
        )
      );
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      author: {
        id: mockUser.id,
        name: mockUser.name,
        role: mockUser.role,
      },
      content,
      createdAt: new Date().toISOString(),
    };
    setAllComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount + 1 }
          : p
      )
    );
  }, []);

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
