import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 36 }).primaryKey(),
  content: text("content").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  externalPostId: varchar("external_post_id", { length: 100 }),
  channelAccountId: varchar("channel_account_id", { length: 36 }),
});
