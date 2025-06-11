import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ★ as const を付けてリテラル型化
const timestamp = { mode: "timestamp" } as const;

export const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    completed: integer("completed").notNull().default(0),
    createdAt: integer("created_at", timestamp).notNull(),
    updatedAt: integer("updated_at", timestamp).notNull(),
    reminderAt: integer("reminder_at", timestamp),
    dueAt: integer("due_at", timestamp),
    reminderOffset: integer("reminder_offset"),
    reminded: integer("reminded").notNull().default(0),
});

export const companies = sqliteTable("companies", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    industry: text("industry").notNull(),
    appliedDate: integer("applied_date", timestamp).notNull(),
    status: text("status").notNull(),
    memo: text("memo"),
    createdAt: integer("created_at", timestamp).notNull(),
    updatedAt: integer("updated_at", timestamp).notNull(),
});
