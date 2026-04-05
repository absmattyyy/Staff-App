import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../lib/auth.js";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "E-Mail und Passwort erforderlich" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "Ungültige Anmeldedaten" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Ungültige Anmeldedaten" });
    return;
  }
  const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
  res.json({
    token,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      joinedAt: user.joinedAt,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "Benutzer nicht gefunden" });
    return;
  }
  res.json({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    phone: user.phone,
    joinedAt: user.joinedAt,
    isAdmin: user.isAdmin,
    avatar: user.avatar,
  });
});

export default router;
