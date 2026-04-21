import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const userProviders = mysqlTable("user_providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),

  provider: varchar("provider", { length: 50 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),

  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
