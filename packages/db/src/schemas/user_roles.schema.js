"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const user_schema_1 = require("./user.schema");
const role_schema_1 = require("./role.schema");
exports.userRoles = (0, mysql_core_1.mysqlTable)('user_roles', {
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => user_schema_1.users.id, { onDelete: 'cascade' }),
    roleId: (0, mysql_core_1.varchar)('role_id', { length: 36 })
        .notNull()
        .references(() => role_schema_1.roles.id, { onDelete: 'cascade' }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
//# sourceMappingURL=user_roles.schema.js.map