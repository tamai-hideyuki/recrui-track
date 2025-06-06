import { Todo as TodoEntity } from "../../domain/entity/Todo";
import { todos } from "../db/schema";
import { db } from "../db/db";
import { eq, desc } from "drizzle-orm";

// Drizzle の行レコードをドメイン TodoEntity に変換するヘルパー
function toDomain(row: {
    id: string;
    title: string;
    completed: number;
    created_at: Date;
    updated_at: Date;
}): TodoEntity {
    return TodoEntity.reconstruct({
        id: row.id,
        title: row.title,
        completed: row.completed as 0 | 1,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    });
}


export class DrizzleTodoRepository {
    /** 全件取得 */
    async findAll(): Promise<TodoEntity[]> {
        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
            })
            .from(todos);

        return rows.map((r) => toDomain(r));
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<TodoEntity | null> {
        const rows = await db
            .select({
                id: todos.id,
                title: todos.title,
                completed: todos.completed,
                created_at: todos.createdAt,
                updated_at: todos.updatedAt,
            })
            .from(todos)
            .where(eq(todos.id, id))
            .limit(1);

        if (rows.length === 0) return null;
        return toDomain(rows[0]);
    }

    /** 挿入・更新（upsert） */
    async save(todo: TodoEntity): Promise<void> {
        const data = {
            id: todo.id,
            title: todo.title,
            completed: todo.completed ? 1 : 0,
            createdAt: todo.createdAt.getTime(),
            updatedAt: todo.updatedAt.getTime(),
        };


        // ★ いったん findById() して、存在チェックだけ行う ★
        const existing = await this.findById(data.id);

        if (existing) {
            // UPDATE
            await db.update(todos).set({
                title: data.title,
                completed: data.completed,
                updatedAt: new Date(data.updatedAt),
            })
                .where(eq(todos.id, data.id));

        } else {
            // INSERT
            await db.insert(todos).values({
                id: data.id,
                title: data.title,
                completed: data.completed,
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
            });

        }
    }

    /** ID で削除 */
    async deleteById(id: string): Promise<void> {
        await db.delete(todos).where(eq(todos.id, id));
    }
}
