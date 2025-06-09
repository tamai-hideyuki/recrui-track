import { eq, and, gte, lt } from "drizzle-orm";
import { db } from "../db/db";
import { todos } from "../db/schema";
import { Todo as TodoEntity } from "../../domain/entity/Todo";

// ドメイン変換ヘルパー
function toDomain(row: {
    id: string;
    title: string;
    completed: number;
    created_at: Date;
    updated_at: Date;
    reminder_at: Date | null;
    due_at: Date | null;
    reminder_offset: number | null;
    reminded: number;
}): TodoEntity {
    return TodoEntity.reconstruct({
        id: row.id,
        title: row.title,
        completed: row.completed === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        reminderAt: row.reminder_at,
        dueAt: row.due_at,
        reminderOffset: row.reminder_offset,
        reminded: row.reminded === 1,
    });
}

export class DrizzleTodoRepository {
    /** 全件取得（期限昇順ソート） */
    async findAll(): Promise<TodoEntity[]> {
        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
                reminder_at: todos.reminderAt,
                due_at: todos.dueAt,
                reminder_offset: todos.reminderOffset,
                reminded: todos.reminded,
            })
            .from(todos)
            .orderBy(todos.dueAt);  // dueAt を昇順ソート

        return rows.map(toDomain);
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<TodoEntity | null> {
        const row = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
                reminder_at: todos.reminderAt,
                due_at: todos.dueAt,
                reminder_offset: todos.reminderOffset,
                reminded: todos.reminded,
            })
            .from(todos)
            .where(eq(todos.id, id))
            .limit(1)
            .then(rs => rs[0] || null);

        return row ? toDomain(row) : null;
    }

    /** 今日が〆切のものだけ取得 */
    async findDueToday(): Promise<TodoEntity[]> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
                reminder_at: todos.reminderAt,
                due_at: todos.dueAt,
                reminder_offset: todos.reminderOffset,
                reminded: todos.reminded,
            })
            .from(todos)
            .where(and(
                gte(todos.dueAt, start),
                lt(todos.dueAt, end),
            ));

        return rows.map(toDomain);
    }

    /** 〆切を過ぎたものだけ取得 */
    async findOverdue(): Promise<TodoEntity[]> {
        const now = new Date();

        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
                reminder_at: todos.reminderAt,
                due_at: todos.dueAt,
                reminder_offset: todos.reminderOffset,
                reminded: todos.reminded,
            })
            .from(todos)
            .where(lt(todos.dueAt, now));

        return rows.map(toDomain);
    }

    /** これから先の〆切（今日以降）だけ取得 */
    async findUpcoming(): Promise<TodoEntity[]> {
        const now = new Date();

        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
                reminder_at: todos.reminderAt,
                due_at: todos.dueAt,
                reminder_offset: todos.reminderOffset,
                reminded: todos.reminded,
            })
            .from(todos)
            .where(gte(todos.dueAt, now));

        return rows.map(toDomain);
    }

    /** 新規作成・更新 */
    async save(todo: TodoEntity): Promise<void> {
        await db
            .insert(todos)
            .values({
                id: todo.id,
                title: todo.title,
                completed: todo.completed ? 1 : 0,
                createdAt: todo.createdAt,
                updatedAt: todo.updatedAt,
                reminderAt: todo.reminderAt,
                dueAt: todo.dueAt,
                reminderOffset: todo.reminderOffset,
                reminded: todo.reminded ? 1 : 0,
            })
            .onConflictDoUpdate({
                target: todos.id,
                set: {
                    title: todo.title,
                    completed: todo.completed ? 1 : 0,
                    updatedAt: todo.updatedAt,
                    reminderAt: todo.reminderAt,
                    dueAt: todo.dueAt,
                    reminderOffset: todo.reminderOffset,
                    reminded: todo.reminded ? 1 : 0,
                },
            });
    }

    /** 期限超過時に通知ステータスを “通知済み” に更新 */
    async markNotified(id: string): Promise<void> {
        await db
            .update(todos)
            .set({ reminded: 1 })
            .where(eq(todos.id, id));
    }

    /** ID で削除 */
    async deleteById(id: string): Promise<void> {
        await db
            .delete(todos)
            .where(eq(todos.id, id));
    }
}
