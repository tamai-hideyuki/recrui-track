import { eq, type InferModel } from "drizzle-orm";
import { db } from "../../infrastructure/db/db";
import { todos } from "../../infrastructure/db/schema";
import { Todo as TodoEntity } from "../../domain/entity/Todo";

// Drizzle の行レコード型を引き出すユーティリティ型
type TodoRow = InferModel<typeof todos, "select">;


export class TodoRepository {
    /** 全件取得 */
    async findAll(): Promise<TodoEntity[]> {
        const rows: TodoRow[] = await db.select().from(todos);
        return rows.map(toDomain);
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<TodoEntity | null> {
        const row: TodoRow | undefined = await db
            .select()
            .from(todos)
            .where(eq(todos.id, id))
            .limit(1)
            .then((r) => r[0]);
        return row ? toDomain(row) : null;
    }

    /** upsert */
    async save(todo: TodoEntity): Promise<void> {
        await db
            .insert(todos)
            .values({
                id:             todo.id,
                title:          todo.title,
                completed:      todo.completed ? 1 : 0,
                createdAt:      todo.createdAt,
                updatedAt:      todo.updatedAt,
                reminderAt:     todo.reminderAt,
                dueAt:          todo.dueAt,
                reminderOffset: todo.reminderOffset,
                reminded:       todo.reminded ? 1 : 0,
            })
            .onConflictDoUpdate({
                target: todos.id,
                set: {
                    title:          todo.title,
                    completed:      todo.completed ? 1 : 0,
                    updatedAt:      todo.updatedAt,
                    reminderAt:     todo.reminderAt,
                    dueAt:          todo.dueAt,
                    reminderOffset: todo.reminderOffset,
                    reminded:       todo.reminded ? 1 : 0,
                },
            });
    }

    /** ID で削除 */
    async deleteById(id: string): Promise<void> {
        await db.delete(todos).where(eq(todos.id, id));
    }
}

// 生レコードをドメインに変換するヘルパー
function toDomain(row: TodoRow): TodoEntity {
    return TodoEntity.reconstruct({
        id:             row.id,
        title:          row.title,
        completed:      row.completed === 1,
        createdAt:      row.createdAt,
        updatedAt:      row.updatedAt,
        reminderAt:     row.reminderAt,
        dueAt:          row.dueAt,
        reminderOffset: row.reminderOffset,
        reminded:       row.reminded === 1,
    });
}
