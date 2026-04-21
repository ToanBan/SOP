"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProviders = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.userProviders = (0, mysql_core_1.mysqlTable)("user_providers", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 }).notNull(),
    provider: (0, mysql_core_1.varchar)("provider", { length: 50 }).notNull(),
    providerId: (0, mysql_core_1.varchar)("provider_id", { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
//# sourceMappingURL=user_providers.schema.js.map