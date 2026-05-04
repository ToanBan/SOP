import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey(),

  channelAccountId: varchar("channel_account_id", { length: 36 }).notNull(),

  conversationId: varchar("conversation_id", { length: 36 }).notNull(),

  customerId: varchar("customer_id", { length: 36 }),

  senderType: varchar("sender_type", { length: 20 }).notNull(),

  senderId: varchar("sender_id", { length: 36 }),

  type: varchar("type", { length: 20 }).notNull(),

  content: text("content"),

  mediaUrl: varchar("media_url", { length: 255 }),

  externalMessageId: varchar("external_message_id", { length: 100 }),

  metadata: text("metadata"),

  createdAt: timestamp("created_at").defaultNow(),
});
