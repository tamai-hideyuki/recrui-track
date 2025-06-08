import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
    id:         text("id").primaryKey(),
    title:      text("title").notNull(),
    completed:  integer("completed").notNull().default(0),
    createdAt:  integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt:  integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
    reminderAt: integer("reminder_at", { mode: "timestamp" }).nullable(),
});
