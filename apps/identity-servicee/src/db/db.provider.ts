import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export const DB_PROVIDER = "DB_PROVIDER";

export const dbProvider = {
	provide: DB_PROVIDER,
	useFactory: async () => {
		const connection = await mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "rootpassword",
			database: "sop_db",
		});

		return drizzle(connection);
	},
};
