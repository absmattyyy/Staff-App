import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    email: u.email,
    phone: u.phone,
    joinedAt: u.joinedAt,
    isAdmin: u.isAdmin,
    avatar: u.avatar,
  };
}

router.get("/users", requireAuth, async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.firstName);
  res.json(users.map(formatUser));
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
  const { email, password, firstName, lastName, role, phone, isAdmin } =
    req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
      phone?: string;
      isAdmin?: boolean;
    };
  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({ error: "Pflichtfelder fehlen" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const today = new Date().toISOString().slice(0, 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName,
      lastName,
      role: role || "Mitarbeiter",
      phone,
      joinedAt: today,
      isAdmin: isAdmin ?? false,
    })
    .returning();
  res.status(201).json(formatUser(user));
});

router.get("/users/:id", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.id))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "Benutzer nicht gefunden" });
    return;
  }
  res.json(formatUser(user));
});

router.put("/users/:id", requireAuth, async (req, res) => {
  const isOwnProfile = req.user!.userId === req.params.id;
  if (!isOwnProfile && !req.user!.isAdmin) {
    res.status(403).json({ error: "Keine Berechtigung" });
    return;
  }
  const { firstName, lastName, phone, password, role, isAdmin } =
    req.body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      password?: string;
      role?: string;
      isAdmin?: boolean;
    };
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone !== undefined) updates.phone = phone;
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  if (req.user!.isAdmin && role) updates.role = role;
  if (req.user!.isAdmin && isAdmin !== undefined) updates.isAdmin = isAdmin;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.params.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "Benutzer nicht gefunden" });
    return;
  }
  res.json(formatUser(user));
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
  res.status(204).send();
});

export default router;
