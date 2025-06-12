import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// timestamp オプションをリテラル型化
const timestamp = { mode: "timestamp" } as const;
// timestamp 用の integer カラムを簡潔に定義するヘルパー
const tsInt = (col: string) => integer(col, timestamp);

export const todos = sqliteTable("todos", {
    id:             text("id").primaryKey(),
    title:          text("title").notNull(),
    completed:      integer("completed").notNull().default(0),
    reminderAt:     tsInt("reminder_at"),
    dueAt:          tsInt("due_at"),
    reminderOffset: integer("reminder_offset"),
    reminded:       integer("reminded").notNull().default(0),
    createdAt:      tsInt("created_at").notNull(),
    updatedAt:      tsInt("updated_at").notNull(),
});

export const companies = sqliteTable("companies", {
    id:           text("id").primaryKey(),
    name:         text("name").notNull(),
    industry:     text("industry").notNull(),
    url:          text("url").notNull().default(""),  // ← 追加: 既存データは空文字で保持
    appliedDate:  tsInt("applied_date").notNull(),
    status:       text("status").notNull(),
    memo:         text("memo"),
    createdAt:    tsInt("created_at").notNull(),
    updatedAt:    tsInt("updated_at").notNull(),
});
