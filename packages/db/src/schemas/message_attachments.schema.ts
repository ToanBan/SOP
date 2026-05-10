import { mysqlTable, varchar, text, timestamp, int } from "drizzle-orm/mysql-core";

export const messageAttachments = mysqlTable("message_attachments", {
  id: varchar("id", { length: 36 }).primaryKey(),

  messageId: varchar("message_id", { length: 36 }).notNull(),

  type: varchar("type", { length: 20 }).notNull(),

  url: varchar("url", { length: 500 }).notNull(),

  fileName: varchar("file_name", { length: 255 }),

  mimeType: varchar("mime_type", { length: 100 }),

  size: int("size"),

  createdAt: timestamp("created_at").defaultNow(),
});