import { mysqlTable, varchar, text, timestamp, int} from "drizzle-orm/mysql-core";


export const campaignMedias = mysqlTable("campaign_medias", {
  id: varchar("id", { length: 36 }).primaryKey(),
  campaignId: varchar("campaign_id", { length: 36 }).notNull(),
  mediaUrl: text("media_url").notNull(),
  order: int("order").default(0), 
  createdAt: timestamp("created_at").defaultNow(),
});