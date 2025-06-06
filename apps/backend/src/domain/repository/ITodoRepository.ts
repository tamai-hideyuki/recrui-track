import { eq } from "drizzle-orm";
import { db } from "../../infrastructure/db/db";
import { todos } from "../../infrastructure/db/schema";
import { Todo as TodoEntity } from "../../domain/entity/Todo";

/**
 * Drizzle で取得した生データを
 * ドメインエンティティに復元するヘルパー
 */
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export interface ITodoRepository {
    findAll(): Promise<TodoEntity[]>;
    findById(id: string): Promise<TodoEntity | null>;
    save(todo: TodoEntity): Promise<void>;
    deleteById(id: string): Promise<void>;
}

export class TodoRepository implements TodoRepository {
    /**
     * 全件取得
     */
    async findAll(): Promise<TodoEntity[]> {
        const rows = await db.select({
            id: todos.id,
            title: todos.title,
            completed: todos.completed,
            created_at: todos.createdAt,
            updated_at: todos.updatedAt,
        }).from(todos);
        return rows.map((row) => toDomain(row));
    }

    /**
     * ID で単一取得
     */
    async findById(id: string): Promise<TodoEntity | null> {
        const row = await db.select({
            id: todos.id,
            title: todos.title,
            completed: todos.completed,
            created_at: todos.createdAt,
            updated_at: todos.updatedAt,
        })
            .from(todos)
            .where(eq(todos.id, id))
            .limit(1);

        if (row.length === 0) {
            return null;
        }
        return toDomain(row[0]);
    }

    /**
     * 挿入 or 更新
     * ドメインエンティティを渡すと DB スキーマに合わせて upsert する
     */
    async save(todo: TodoEntity): Promise<void> {
        const data = {
            id: todo.id,
            title: todo.title,
            completed: todo.completed ? 1 : 0,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
        };

        // 既存レコードが存在すれば UPDATE、存在しなければ INSERT
        const existing = await db.select({ count: todos.id.count().as("cnt") })
            .from(todos)
            .where(eq(todos.id, todo.id))
            .limit(1);

        if ((existing[0]?.cnt ?? 0) > 0) {
            // UPDATE
            await db.update(todos)
                .set({
                    title: data.title,
                    completed: data.completed,
                    updatedAt: data.updatedAt,
                })
                .where(eq(todos.id, data.id));
        } else {
            // INSERT
            await db.insert(todos).values({
                id: data.id,
                title: data.title,
                completed: data.completed,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });
        }
    }

    /**
     * ID を指定して削除
     */
    async deleteById(id: string): Promise<void> {
        await db.delete(todos).where(eq(todos.id, id));
    }
}
