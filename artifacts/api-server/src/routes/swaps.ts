import { Router } from "express";
import { db } from "@workspace/db";
import { swapRequestsTable, shiftsTable, usersTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

async function formatSwap(
  swap: typeof swapRequestsTable.$inferSelect,
  currentUserId: string
) {
  const [shift] = await db
    .select()
    .from(shiftsTable)
    .where(eq(shiftsTable.id, swap.shiftId))
    .limit(1);
  const [requester] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, swap.requestedById))
    .limit(1);
  return {
    id: swap.id,
    shift: shift
      ? {
          id: shift.id,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          eventName: shift.eventName,
          eventId: shift.eventId,
          role: "",
          location: shift.location,
          status: shift.status,
          isOwn: shift.userId === currentUserId,
          notes: shift.notes,
        }
      : null,
    requestedBy: {
      id: requester?.id || swap.requestedById,
      name: requester ? `${requester.firstName} ${requester.lastName}` : "?",
    },
    status: swap.status,
    createdAt: swap.createdAt.toISOString(),
    note: swap.note,
    isOwn: swap.requestedById === currentUserId,
  };
}

router.get("/swaps", requireAuth, async (req, res) => {
  const swaps = await db
    .select()
    .from(swapRequestsTable)
    .orderBy(swapRequestsTable.createdAt);
  const formatted = await Promise.all(
    swaps.map((s) => formatSwap(s, req.user!.userId))
  );
  res.json(formatted);
});

router.post("/swaps", requireAuth, async (req, res) => {
  const { shiftId, note } = req.body as { shiftId: string; note?: string };
  if (!shiftId) {
    res.status(400).json({ error: "Schicht erforderlich" });
    return;
  }
  const [swap] = await db
    .insert(swapRequestsTable)
    .values({ shiftId, requestedById: req.user!.userId, note })
    .returning();
  res.status(201).json(await formatSwap(swap, req.user!.userId));
});

router.put("/swaps/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body as { status: string };
  const valid = ["open", "pending", "approved", "rejected"];
  if (!valid.includes(status)) {
    res.status(400).json({ error: "Ungültiger Status" });
    return;
  }
  const [swap] = await db
    .update(swapRequestsTable)
    .set({ status })
    .where(eq(swapRequestsTable.id, req.params.id))
    .returning();
  if (!swap) {
    res.status(404).json({ error: "Anfrage nicht gefunden" });
    return;
  }
  res.json(await formatSwap(swap, req.user!.userId));
});

router.delete("/swaps/:id", requireAuth, async (req, res) => {
  const [swap] = await db
    .select()
    .from(swapRequestsTable)
    .where(eq(swapRequestsTable.id, req.params.id))
    .limit(1);
  if (!swap) {
    res.status(404).json({ error: "Anfrage nicht gefunden" });
    return;
  }
  if (swap.requestedById !== req.user!.userId && !req.user!.isAdmin) {
    res.status(403).json({ error: "Keine Berechtigung" });
    return;
  }
  await db.delete(swapRequestsTable).where(eq(swapRequestsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
