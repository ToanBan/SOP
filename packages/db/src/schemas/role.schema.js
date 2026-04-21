"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.roles = (0, mysql_core_1.mysqlTable)("roles", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 50 }).notNull().unique(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
//# sourceMappingURL=role.schema.js.map