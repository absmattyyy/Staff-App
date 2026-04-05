import { Router } from "express";
import { db } from "@workspace/db";
import {
  feedPostsTable,
  feedLikesTable,
  commentsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

async function enrichPost(
  post: typeof feedPostsTable.$inferSelect,
  userId: string,
  author: { firstName: string; lastName: string; id: string }
) {
  const like = await db
    .select()
    .from(feedLikesTable)
    .where(
      and(eq(feedLikesTable.postId, post.id), eq(feedLikesTable.userId, userId))
    )
    .limit(1);
  return {
    id: post.id,
    author: {
      id: author.id,
      name: `${author.firstName} ${author.lastName}`,
      role: "",
    },
    content: post.content,
    category: post.category,
    isPinned: post.isPinned,
    isImportant: post.isImportant,
    createdAt: post.createdAt.toISOString(),
    reactions: { like: post.likesCount, heart: 0, thumbsUp: 0, userReacted: like.length ? "like" : undefined },
    commentsCount: post.commentsCount,
  };
}

router.get("/feed", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      post: feedPostsTable,
      author: {
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      },
    })
    .from(feedPostsTable)
    .leftJoin(usersTable, eq(feedPostsTable.authorId, usersTable.id))
    .orderBy(desc(feedPostsTable.isPinned), desc(feedPostsTable.createdAt));

  const enriched = await Promise.all(
    rows.map((r) =>
      enrichPost(
        r.post,
        req.user!.userId,
        r.author ?? { id: "", firstName: "Unbekannt", lastName: "" }
      )
    )
  );
  res.json(enriched);
});

router.post("/feed", requireAuth, async (req, res) => {
  const { content, category, isImportant } = req.body as {
    content: string;
    category?: string;
    isImportant?: boolean;
  };
  if (!content) {
    res.status(400).json({ error: "Inhalt erforderlich" });
    return;
  }
  const [post] = await db
    .insert(feedPostsTable)
    .values({
      authorId: req.user!.userId,
      content,
      category: category || "general",
      isImportant: isImportant ?? false,
    })
    .returning();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);
  res.status(201).json(await enrichPost(post, req.user!.userId, user ?? { id: req.user!.userId, firstName: "?", lastName: "" }));
});

router.put("/feed/:id", requireAuth, async (req, res) => {
  const [existing] = await db
    .select()
    .from(feedPostsTable)
    .where(eq(feedPostsTable.id, req.params.id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Beitrag nicht gefunden" });
    return;
  }
  if (existing.authorId !== req.user!.userId && !req.user!.isAdmin) {
    res.status(403).json({ error: "Keine Berechtigung" });
    return;
  }
  const { content, isPinned, isImportant } = req.body as {
    content?: string;
    isPinned?: boolean;
    isImportant?: boolean;
  };
  const updates: Partial<typeof feedPostsTable.$inferInsert> = {};
  if (content !== undefined) updates.content = content;
  if (isPinned !== undefined) updates.isPinned = isPinned;
  if (isImportant !== undefined) updates.isImportant = isImportant;
  await db
    .update(feedPostsTable)
    .set(updates)
    .where(eq(feedPostsTable.id, req.params.id));
  const [updated] = await db
    .select({ post: feedPostsTable, author: { id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName } })
    .from(feedPostsTable)
    .leftJoin(usersTable, eq(feedPostsTable.authorId, usersTable.id))
    .where(eq(feedPostsTable.id, req.params.id))
    .limit(1);
  res.json(await enrichPost(updated.post, req.user!.userId, updated.author ?? { id: "", firstName: "?", lastName: "" }));
});

router.delete("/feed/:id", requireAuth, async (req, res) => {
  const [existing] = await db
    .select()
    .from(feedPostsTable)
    .where(eq(feedPostsTable.id, req.params.id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Beitrag nicht gefunden" });
    return;
  }
  if (existing.authorId !== req.user!.userId && !req.user!.isAdmin) {
    res.status(403).json({ error: "Keine Berechtigung" });
    return;
  }
  await db.delete(feedPostsTable).where(eq(feedPostsTable.id, req.params.id));
  res.status(204).send();
});

router.post("/feed/:id/like", requireAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user!.userId;
  const [existing] = await db
    .select()
    .from(feedLikesTable)
    .where(and(eq(feedLikesTable.postId, postId), eq(feedLikesTable.userId, userId)))
    .limit(1);

  if (existing) {
    await db
      .delete(feedLikesTable)
      .where(and(eq(feedLikesTable.postId, postId), eq(feedLikesTable.userId, userId)));
    await db
      .update(feedPostsTable)
      .set({ likesCount: db.$count(feedLikesTable, eq(feedLikesTable.postId, postId)) as unknown as number })
      .where(eq(feedPostsTable.id, postId));
    const [p] = await db.select().from(feedPostsTable).where(eq(feedPostsTable.id, postId)).limit(1);
    await db.update(feedPostsTable).set({ likesCount: Math.max(0, (p?.likesCount ?? 1) - 1) }).where(eq(feedPostsTable.id, postId));
    res.json({ liked: false });
  } else {
    await db.insert(feedLikesTable).values({ postId, userId });
    const [p] = await db.select().from(feedPostsTable).where(eq(feedPostsTable.id, postId)).limit(1);
    await db.update(feedPostsTable).set({ likesCount: (p?.likesCount ?? 0) + 1 }).where(eq(feedPostsTable.id, postId));
    res.json({ liked: true });
  }
});

router.get("/feed/:id/comments", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      comment: commentsTable,
      author: { id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName },
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.authorId, usersTable.id))
    .where(eq(commentsTable.postId, req.params.id))
    .orderBy(commentsTable.createdAt);
  res.json(
    rows.map((r) => ({
      id: r.comment.id,
      postId: r.comment.postId,
      author: {
        id: r.author?.id || "",
        name: r.author ? `${r.author.firstName} ${r.author.lastName}` : "?",
        role: "",
      },
      content: r.comment.content,
      createdAt: r.comment.createdAt.toISOString(),
    }))
  );
});

router.post("/feed/:id/comments", requireAuth, async (req, res) => {
  const { content } = req.body as { content: string };
  if (!content) {
    res.status(400).json({ error: "Inhalt erforderlich" });
    return;
  }
  const [comment] = await db
    .insert(commentsTable)
    .values({ postId: req.params.id, authorId: req.user!.userId, content })
    .returning();
  const [p] = await db.select().from(feedPostsTable).where(eq(feedPostsTable.id, req.params.id)).limit(1);
  await db.update(feedPostsTable).set({ commentsCount: (p?.commentsCount ?? 0) + 1 }).where(eq(feedPostsTable.id, req.params.id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  res.status(201).json({
    id: comment.id,
    postId: comment.postId,
    author: {
      id: req.user!.userId,
      name: user ? `${user.firstName} ${user.lastName}` : "?",
      role: "",
    },
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  });
});

export default router;
