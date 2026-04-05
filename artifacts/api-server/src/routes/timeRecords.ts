import { Router } from "express";
import { db } from "@workspace/db";
import { timeRecordsTable } from "@workspace/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/time-records", requireAuth, async (req, res) => {
  const { date, month } = req.query as { date?: string; month?: string };
  const userId = req.user!.userId;

  let query = db
    .select()
    .from(timeRecordsTable)
    .where(eq(timeRecordsTable.userId, userId))
    .$dynamic();

  if (date) {
    query = query.where(
      and(
        eq(timeRecordsTable.userId, userId),
        eq(timeRecordsTable.date, date)
      )!
    );
  } else if (month) {
    query = query.where(
      and(
        eq(timeRecordsTable.userId, userId),
        gte(timeRecordsTable.date, `${month}-01`),
        lte(timeRecordsTable.date, `${month}-31`)
      )!
    );
  }

  const records = await query;
  const grouped: Record<string, typeof records> = {};
  for (const r of records) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }

  const result = Object.entries(grouped).map(([d, bookings]) => ({
    date: d,
    bookings: bookings.map((b) => ({
      id: b.id,
      type: b.type,
      time: b.time,
      date: b.date,
      note: b.note,
    })),
  }));

  res.json(result);
});

router.post("/time-records", requireAuth, async (req, res) => {
  const { type, time, date, note } = req.body as {
    type: string;
    time: string;
    date: string;
    note?: string;
  };
  if (!type || !time || !date) {
    res.status(400).json({ error: "Pflichtfelder fehlen" });
    return;
  }
  const [record] = await db
    .insert(timeRecordsTable)
    .values({ userId: req.user!.userId, type, time, date, note })
    .returning();
  res.status(201).json({
    id: record.id,
    type: record.type,
    time: record.time,
    date: record.date,
    note: record.note,
  });
});

export default router;
