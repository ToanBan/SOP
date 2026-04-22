import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 150 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 150 }),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});