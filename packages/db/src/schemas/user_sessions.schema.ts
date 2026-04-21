import { mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";

export const userSessions = mysqlTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),

  hashedRefreshToken: varchar("hashed_refresh_token", { length: 500 }).notNull().unique(),

  isRevoked: boolean("is_revoked").default(false),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
