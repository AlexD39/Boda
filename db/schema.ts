import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey().default("main"),
  config: text("config").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rsvps = sqliteTable("rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  guestName: text("guest_name").notNull(),
  attendance: text("attendance").notNull(),
  guests: integer("guests").notNull().default(1),
  dietary: text("dietary").notNull().default(""),
  message: text("message").notNull().default(""),
  invitationCode: text("invitation_code").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
