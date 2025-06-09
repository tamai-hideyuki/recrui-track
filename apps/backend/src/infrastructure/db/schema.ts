import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 既存 todos テーブル定義
export const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    completed: integer("completed").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
    reminderAt: integer("reminder_at", { mode: "timestamp" }),
    dueAt: integer("due_at", { mode: "timestamp" }),
    reminderOffset: integer("reminder_offset"),
    reminded: integer("reminded").notNull().default(0),
});

// 新規 companies テーdブル定義

    name: text("name").notNull(),
    industry: text("industry").notNull(),
    appliedDate: integer("applied_date", { mode: "timestamp" }).notNull(),
    status: text("status").notNull(),
    memo: text("memo"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
});
