import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const channelAccounts = mysqlTable("channel_accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 36 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  externalId: varchar("external_id", { length: 100 }),
  name: varchar("name", { length: 150 }),
  accessToken: text("access_token"),
  webhookUrl: text("webhook_url"),
  status: varchar("status", { length: 20 }).default("active"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});