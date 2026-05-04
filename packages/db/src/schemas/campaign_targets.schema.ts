import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";


export const campaignTargets = mysqlTable("campaign_targets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  campaignId: varchar("campaign_id", { length: 36 }).notNull(),
  conversationId: varchar("conversation_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});