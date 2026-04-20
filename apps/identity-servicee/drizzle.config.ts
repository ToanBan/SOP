import type { Config } from "drizzle-kit";

export default {
	schema: "./src/db/schemas",
	out: "./drizzle",
	dialect: "mysql",
	dbCredentials: {
		host: "localhost",
		user: "root",
		password: "rootpassword",
		database: "sop_db",
	},
} satisfies Config;
