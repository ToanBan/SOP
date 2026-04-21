"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.rolePermissions = (0, mysql_core_1.mysqlTable)("role_permissions", {
    roleId: (0, mysql_core_1.varchar)("role_id", { length: 36 }).notNull(),
    permissionId: (0, mysql_core_1.varchar)("permission_id", { length: 36 }).notNull(),
});
