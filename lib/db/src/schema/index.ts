import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("Mitarbeiter"),
  phone: text("phone"),
  joinedAt: text("joined_at").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  avatar: text("avatar"),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location"),
  description: text("description"),
  djs: text("djs").array().notNull().default([]),
  status: text("status").notNull().default("upcoming"),
  flyerUri: text("flyer_uri"),
  protocol: text("protocol"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventStaffTable = pgTable("event_staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => usersTable.id),
  name: text("name").notNull(),
});

export const shiftsTable = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").references(() => eventsTable.id, {
    onDelete: "set null",
  }),
  eventName: text("event_name").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedPostsTable = pgTable("feed_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  isPinned: boolean("is_pinned").notNull().default(false),
  isImportant: boolean("is_important").notNull().default(false),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedLikesTable = pgTable(
  "feed_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => feedPostsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("feed_likes_post_user").on(table.postId, table.userId),
  ]
);

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => feedPostsTable.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const swapRequestsTable = pgTable("swap_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftId: uuid("shift_id")
    .notNull()
    .references(() => shiftsTable.id, { onDelete: "cascade" }),
  requestedById: uuid("requested_by_id")
    .notNull()
    .references(() => usersTable.id),
  status: text("status").notNull().default("open"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const timeRecordsTable = pgTable("time_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  time: text("time").notNull(),
  date: text("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const unavailabilitiesTable = pgTable("unavailabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;
export type EventStaff = typeof eventStaffTable.$inferSelect;
export type Shift = typeof shiftsTable.$inferSelect;
export type NewShift = typeof shiftsTable.$inferInsert;
export type FeedPost = typeof feedPostsTable.$inferSelect;
export type Comment = typeof commentsTable.$inferSelect;
export type SwapRequest = typeof swapRequestsTable.$inferSelect;
export type TimeRecord = typeof timeRecordsTable.$inferSelect;
export type Unavailability = typeof unavailabilitiesTable.$inferSelect;
