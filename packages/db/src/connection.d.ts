import mysql from "mysql2/promise";
export declare const getDb: () => import("node_modules/drizzle-orm/mysql2").MySql2Database<Record<string, never>> & {
    $client: mysql.Pool;
};
