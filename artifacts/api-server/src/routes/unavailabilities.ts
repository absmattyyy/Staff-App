import { Router } from "express";
import { db } from "@workspace/db";
import { unavailabilitiesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/unavailabilities", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      u: unavailabilitiesTable,
      user: { id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName },
    })
    .from(unavailabilitiesTable)
    .leftJoin(usersTable, eq(unavailabilitiesTable.userId, usersTable.id))
    .orderBy(unavailabilitiesTable.date);
  res.json(
    rows.map((r) => ({
      id: r.u.id,
      userId: r.u.userId,
      userName: r.user ? `${r.user.firstName} ${r.user.lastName}` : "?",
      date: r.u.date,
      reason: r.u.reason,
    }))
  );
});

router.post("/unavailabilities", requireAuth, async (req, res) => {
  const { date, reason } = req.body as { date: string; reason?: string };
  if (!date) {
    res.status(400).json({ error: "Datum erforderlich" });
    return;
  }
  const [entry] = await db
    .insert(unavailabilitiesTable)
    .values({ userId: req.user!.userId, date, reason })
    .returning();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);
  res.status(201).json({
    id: entry.id,
    userId: entry.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : "?",
    date: entry.date,
    reason: entry.reason,
  });
});

router.delete("/unavailabilities/:id", requireAuth, async (req, res) => {
  const [entry] = await db
    .select()
    .from(unavailabilitiesTable)
    .where(eq(unavailabilitiesTable.id, req.params.id))
    .limit(1);
  if (!entry) {
    res.status(404).json({ error: "Nicht gefunden" });
    return;
  }
  if (entry.userId !== req.user!.userId && !req.user!.isAdmin) {
    res.status(403).json({ error: "Keine Berechtigung" });
    return;
  }
  await db.delete(unavailabilitiesTable).where(eq(unavailabilitiesTable.id, req.params.id));
  res.status(204).send();
});

export default router;
