import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const roles = mysqlTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
