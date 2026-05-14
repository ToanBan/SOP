import { mysqlTable, varchar, text, timestamp, json } from "drizzle-orm/mysql-core";

export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  messageId: varchar("message_id", { length: 36 }).notNull(),
  data: text("data"),
  participants: json("participants").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});