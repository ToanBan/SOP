"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.permissions = (0, mysql_core_1.mysqlTable)("permissions", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, mysql_core_1.text)("description"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
//# sourceMappingURL=permissions.schema.js.map