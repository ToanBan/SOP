export declare const userRoles: import("node_modules/drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "user_roles";
    schema: undefined;
    columns: {
        userId: import("node_modules/drizzle-orm/mysql-core").MySqlColumn<{
            name: "user_id";
            tableName: "user_roles";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        roleId: import("node_modules/drizzle-orm/mysql-core").MySqlColumn<{
            name: "role_id";
            tableName: "user_roles";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("node_modules/drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "user_roles";
            dataType: "date";
            columnType: "MySqlTimestamp";
            data: Date;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "mysql";
}>;
