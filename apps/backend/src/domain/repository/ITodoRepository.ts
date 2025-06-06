import { eq } from "drizzle-orm";
import { db } from "../../infrastructure/db/db";
import { todos } from "../../infrastructure/db/schema";
import { Todo as TodoEntity } from "../../domain/entity/Todo";


function toDomain(row: {
    id: string;
    title: string;
    completed: number;
    created_at: Date;
    updated_at: Date;
}): TodoEntity {
    // ドメインエンティティに復元するヘルパー
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

export class TodoRepository implements ITodoRepository {
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

        if (rows.length === 0) {
            return null;
        }
        return toDomain(rows[0]);
    }

    async save(todo: TodoEntity): Promise<void> {
        const data = {
            id: todo.id,
            title: todo.title,
            completed: todo.completed ? 1 : 0,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
        };

        // ────────── ここが重要 ──────────
        // いったん findById して、存在すれば UPDATE、いなければ INSERT
        const existing = await this.findById(data.id);
        if (existing) {
            // UPDATE
            await db
                .update(todos)
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

    async deleteById(id: string): Promise<void> {
        await db.delete(todos).where(eq(todos.id, id));
    }
}
