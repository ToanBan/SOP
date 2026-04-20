import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const rolePermissions = mysqlTable("role_permissions", {
  roleId: varchar("role_id", { length: 36 }).notNull(),
  permissionId: varchar("permission_id", { length: 36 }).notNull(),
});