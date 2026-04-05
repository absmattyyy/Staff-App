import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable,
  eventStaffTable,
  shiftsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

async function getEventWithStaff(eventId: string) {
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, eventId))
    .limit(1);
  if (!event) return null;
  const staff = await db
    .select()
    .from(eventStaffTable)
    .where(eq(eventStaffTable.eventId, eventId));
  return {
    ...event,
    djs: event.djs || [],
    staff: staff.map((s) => ({ id: s.userId || s.id, name: s.name, role: "" })),
  };
}

router.get("/events", requireAuth, async (_req, res) => {
  const events = await db
    .select()
    .from(eventsTable)
    .orderBy(eventsTable.date);
  const result = await Promise.all(
    events.map(async (e) => {
      const staff = await db
        .select()
        .from(eventStaffTable)
        .where(eq(eventStaffTable.eventId, e.id));
      return {
        ...e,
        djs: e.djs || [],
        staff: staff.map((s) => ({
          id: s.userId || s.id,
          name: s.name,
          role: "",
        })),
      };
    })
  );
  res.json(result);
});

router.get("/events/:id", requireAuth, async (req, res) => {
  const event = await getEventWithStaff(req.params.id);
  if (!event) {
    res.status(404).json({ error: "Event nicht gefunden" });
    return;
  }
  res.json(event);
});

router.post("/events", requireAuth, requireAdmin, async (req, res) => {
  const { name, date, startTime, endTime, location, description, djs, staff, flyerUri } =
    req.body as {
      name: string;
      date: string;
      startTime: string;
      endTime: string;
      location?: string;
      description?: string;
      djs?: string[];
      staff?: { id?: string; name: string }[];
      flyerUri?: string;
    };
  if (!name || !date || !startTime || !endTime) {
    res.status(400).json({ error: "Pflichtfelder fehlen" });
    return;
  }
  const [event] = await db
    .insert(eventsTable)
    .values({
      name,
      date,
      startTime,
      endTime,
      location,
      description,
      djs: djs || [],
      flyerUri,
      status: "upcoming",
    })
    .returning();

  if (staff?.length) {
    await db.insert(eventStaffTable).values(
      staff.map((s) => ({
        eventId: event.id,
        userId: s.id || null,
        name: s.name,
      }))
    );
    await db.insert(shiftsTable).values(
      staff
        .filter((s) => s.id)
        .map((s) => ({
          userId: s.id!,
          eventId: event.id,
          eventName: name,
          date,
          startTime,
          endTime,
          location: location || "",
          status: "confirmed",
        }))
    );
  }

  const full = await getEventWithStaff(event.id);
  res.status(201).json(full);
});

router.put("/events/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, date, startTime, endTime, location, description, djs, status, protocol, flyerUri, staff } =
    req.body as {
      name?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      description?: string;
      djs?: string[];
      status?: string;
      protocol?: string;
      flyerUri?: string;
      staff?: { id?: string; name: string }[];
    };

  const updates: Partial<typeof eventsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (date !== undefined) updates.date = date;
  if (startTime !== undefined) updates.startTime = startTime;
  if (endTime !== undefined) updates.endTime = endTime;
  if (location !== undefined) updates.location = location;
  if (description !== undefined) updates.description = description;
  if (djs !== undefined) updates.djs = djs;
  if (status !== undefined) updates.status = status;
  if (protocol !== undefined) updates.protocol = protocol;
  if (flyerUri !== undefined) updates.flyerUri = flyerUri;

  const [updated] = await db
    .update(eventsTable)
    .set(updates)
    .where(eq(eventsTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Event nicht gefunden" });
    return;
  }

  if (staff !== undefined) {
    await db
      .delete(eventStaffTable)
      .where(eq(eventStaffTable.eventId, req.params.id));
    if (staff.length) {
      await db.insert(eventStaffTable).values(
        staff.map((s) => ({
          eventId: req.params.id,
          userId: s.id || null,
          name: s.name,
        }))
      );
    }
  }

  const full = await getEventWithStaff(req.params.id);
  res.json(full);
});

router.delete("/events/:id", requireAuth, requireAdmin, async (req, res) => {
  await db.delete(eventsTable).where(eq(eventsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
