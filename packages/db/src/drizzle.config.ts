import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schemas",          
  out: "./drizzle",           

  dialect: "mysql",

  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "rootpassword",
    database: "sop_db",
  },
});