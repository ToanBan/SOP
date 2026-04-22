import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const customerIdentities = mysqlTable("customer_identities", {
  id: varchar("id", { length: 36 }).primaryKey(),

  customerId: varchar("customer_id", { length: 36 }).notNull(),

  channelAccountId: varchar("channel_account_id", { length: 36 }).notNull(),

  platform: varchar("platform", { length: 50 }).notNull(),

  externalId: varchar("external_id", { length: 100 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
