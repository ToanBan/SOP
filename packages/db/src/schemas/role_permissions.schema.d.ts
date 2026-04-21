export declare const rolePermissions: import("node_modules/drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "role_permissions";
    schema: undefined;
    columns: {
        roleId: import("node_modules/drizzle-orm/mysql-core").MySqlColumn<{
            name: "role_id";
            tableName: "role_permissions";
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
        permissionId: import("node_modules/drizzle-orm/mysql-core").MySqlColumn<{
            name: "permission_id";
            tableName: "role_permissions";
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
    };
    dialect: "mysql";
}>;
