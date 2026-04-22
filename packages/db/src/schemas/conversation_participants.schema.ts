import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const conversationParticipants = mysqlTable("conversation_participants", {
  id: varchar("id", { length: 36 }).primaryKey(),

  conversationId: varchar("conversation_id", { length: 36 }).notNull(),

  customerId: varchar("customer_id", { length: 36 }).notNull(),

  role: varchar("role", { length: 20 }).notNull(),

  joinedAt: timestamp("joined_at").defaultNow(),
});