"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSessions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.userSessions = (0, mysql_core_1.mysqlTable)("user_sessions", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 }).notNull(),
    hashedRefreshToken: (0, mysql_core_1.varchar)("hashed_refresh_token", { length: 500 }).notNull().unique(),
    isRevoked: (0, mysql_core_1.boolean)("is_revoked").default(false),
    expiresAt: (0, mysql_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
//# sourceMappingURL=user_sessions.schema.js.map