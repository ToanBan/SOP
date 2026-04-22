import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey(),

  channelAccountId: varchar("channel_account_id", { length: 36 }).notNull(),

  type: varchar("type", { length: 20 }).notNull(),

  title: varchar("title", { length: 255 }),

  externalConversationId: varchar("external_conversation_id", { length: 100 }),

  lastMessageAt: timestamp("last_message_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});