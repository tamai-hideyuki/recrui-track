// @ts-ignore
import { sqliteTable, text, integer, timestamp } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    completed: integer("completed").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
