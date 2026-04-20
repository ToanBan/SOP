import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { roles } from './role.schema';
export const userRoles = mysqlTable('user_roles', {
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  roleId: varchar('role_id', { length: 36 })
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow(),
});
