import { mysqlTable, varchar, timestamp, index } from "drizzle-orm/mysql-core";

export const notificationReads = mysqlTable(
  "notification_reads",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    notificationId: varchar("notification_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    readAt: timestamp("read_at").defaultNow(),
  },
  (table) => ({
    notificationIdIdx: index("idx_notification_id").on(table.notificationId),
    userIdIdx: index("idx_user_id").on(table.userId),
  }),
);
