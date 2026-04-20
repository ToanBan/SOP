import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});