import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
    id:           text("id").primaryKey(),
    title:        text("title").notNull(),
    completed:    integer("completed").notNull().default(0),
    createdAt:    integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt:    integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),

    reminderAt:   integer("reminder_at",   { mode: "timestamp" }), // 通知日時
    dueAt:        integer("due_at",        { mode: "timestamp" }), // 〆切日時
    reminderOffset: integer("reminder_offset"),                   // 〆切何秒前に通知
    reminded:     integer("reminded").notNull().default(0),        // 通知済みフラグ
});

    name:           text("name").notNull(),
    industry:       text("industry").notNull(),
    appliedDate:    integer("applied_date", { mode: "timestamp" }).notNull(),
    status:         text("status").notNull(),
    memo:           text("memo"),
    createdAt:      integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt:      integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
});