import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/shifts", requireAuth, async (req, res) => {
  const userId = (req.query.userId as string) || req.user!.userId;
  const rows = await db
    .select()
    .from(shiftsTable)
    .where(eq(shiftsTable.userId, userId))
    .orderBy(shiftsTable.date);
  res.json(
    rows.map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      eventName: s.eventName,
      eventId: s.eventId,
      role: "",
      location: s.location,
      status: s.status,
      isOwn: s.userId === req.user!.userId,
      notes: s.notes,
    }))
  );
});

router.get("/shifts/all", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      shift: shiftsTable,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      },
    })
    .from(shiftsTable)
    .leftJoin(usersTable, eq(shiftsTable.userId, usersTable.id))
    .orderBy(shiftsTable.date);
  res.json(rows);
});

router.post("/shifts", requireAuth, requireAdmin, async (req, res) => {
  const { userId, eventId, eventName, date, startTime, endTime, location, notes, status } =
    req.body as {
      userId: string;
      eventId?: string;
      eventName: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      notes?: string;
      status?: string;
    };
  if (!userId || !eventName || !date || !startTime || !endTime || !location) {
    res.status(400).json({ error: "Pflichtfelder fehlen" });
    return;
  }
  const [shift] = await db
    .insert(shiftsTable)
    .values({ userId, eventId, eventName, date, startTime, endTime, location, notes, status: status || "confirmed" })
    .returning();
  res.status(201).json({
    id: shift.id,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    eventName: shift.eventName,
    eventId: shift.eventId,
    role: "",
    location: shift.location,
    status: shift.status,
    isOwn: shift.userId === req.user!.userId,
    notes: shift.notes,
  });
});

router.put("/shifts/:id", requireAuth, requireAdmin, async (req, res) => {
  const { status, notes, startTime, endTime } = req.body as {
    status?: string;
    notes?: string;
    startTime?: string;
    endTime?: string;
  };
  const updates: Partial<typeof shiftsTable.$inferInsert> = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (startTime) updates.startTime = startTime;
  if (endTime) updates.endTime = endTime;
  const [shift] = await db
    .update(shiftsTable)
    .set(updates)
    .where(eq(shiftsTable.id, req.params.id))
    .returning();
  if (!shift) {
    res.status(404).json({ error: "Schicht nicht gefunden" });
    return;
  }
  res.json({ ...shift, role: "", isOwn: shift.userId === req.user!.userId });
});

router.delete("/shifts/:id", requireAuth, requireAdmin, async (req, res) => {
  await db.delete(shiftsTable).where(eq(shiftsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
