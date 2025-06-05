import { ITodoRepository } from "../../domain/repository/ITodoRepository";
import { Todo as TodoEntity } from "../../domain/entity/Todo";
import { todos } from "../db/schema";
import { db } from "../db/db";
import { eq, desc } from "drizzle-orm";

function mapRecordToEntity(record: {
    id: string;
    title: string;
    completed: number;
    createdAt: Date;
    updatedAt: Date;
}): TodoEntity {
    return TodoEntity.reconstruct({
        id: record.id,
        title: record.title,
        completed: record.completed as 0 | 1,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });
}

export class DrizzleTodoRepository implements ITodoRepository {
    public async findAll(): Promise<TodoEntity[]> {
        const rows = await db
        .select()
        .from(todos)
        .orderBy(desc(todos.createdAt));
        return rows.map((r) => mapRecordToEntity(r));
    }

    public async findById(id: string): Promise<TodoEntity | null> {
        const rows = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
        if (rows.length === 0) return null;
        return mapRecordToEntity(rows[0]);
    }

    public async save(todo: TodoEntity): Promise<void> {
        const existing = await this.findById(todo.id);
        if (existing) {
            await db
                .update(todos)
                .set({
                    title: todo.title,
                    completed: todo.completed ? 1 : 0,
                    updatedAt: new Date(),
                })
                .where(eq(todos.id, todo.id));
        } else {
            await db.insert(todos).values({
                id: todo.id,
                title: todo.title,
                completed: todo.completed ? 1 : 0,
                createdAt: todo.createdAt,
                updatedAt: todo.updatedAt,
            });
        }
    }

    public async deleteById(id: string): Promise<void> {
        await db.delete(todos).where(eq(todos.id, id));
    }
}
