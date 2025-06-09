import { Context } from "hono";
import { v4 as uuidv4 } from "uuid";

import { Todo as TodoEntity } from "../../domain/entity/Todo";
import { TodoResponseDto } from "../dto/TodoResponseDto";
import { DrizzleTodoRepository } from "../../infrastructure/repository/DrizzleTodoRepository";

const repo = new DrizzleTodoRepository();

export class TodoController {
    /**
     * GET /api/todos
     * 全件取得して DTO 配列を返す
     */
    static async getAll(c: Context, filter?: string) {
        try {
            let todos: TodoEntity[];

            // フィルタに応じて取得メソッドを選択
            switch (filter) {
                case "due-today":
                    todos = await repo.findDueToday();
                    break;
                case "overdue":
                    todos = await repo.findOverdue();
                    break;
                case "upcoming":
                    todos = await repo.findUpcoming();
                    break;
                default:
                    todos = await repo.findAll();
            }

            // 期限超過かつ未通知のものはドメインでマーク＆永続化
            for (const t of todos) {
                t.markRemindedIfOverdue();
                if (t.reminded) {
                    await repo.markNotified(t.id);
                }
            }

            // DTO にマッピング
            const result: TodoResponseDto[] = todos.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed ? 1 : 0,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
                reminderAt:     t.reminderAt    ? t.reminderAt.toISOString()    : null,
                dueAt:          t.dueAt         ? t.dueAt.toISOString()         : null,
                reminderOffset: t.reminderOffset ?? null,
                reminded:       t.reminded      ? 1 : 0,
            }));

            return c.json(result);
        } catch (err) {
            console.error("Failed to fetch todos:", err);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }

    /**
     * GET /api/todos/:id
     * 指定 ID の Todo を取得して DTO を返す
     */
    static async getById(c: Context) {
        try {
            const id = c.req.param("id");
            const todoEntity = await repo.findById(id);

            if (!todoEntity) {
                return c.json({ message: "Not Found" }, 404);
            }

            const dto: TodoResponseDto = {
                id: todoEntity.id,
                title: todoEntity.title,
                completed: todoEntity.completed ? 1 : 0,
                createdAt: todoEntity.createdAt.toISOString(),
                updatedAt: todoEntity.updatedAt.toISOString(),
                reminderAt:     todoEntity.reminderAt    ? todoEntity.reminderAt.toISOString()    : null,
                dueAt:          todoEntity.dueAt         ? todoEntity.dueAt.toISOString()         : null,
                reminderOffset: todoEntity.reminderOffset ?? null,
                reminded:       todoEntity.reminded       ? 1 : 0,
            };

            return c.json(dto);
        } catch (err) {
            console.error(`Failed to fetch todo by id: ${err}`);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }

    /**
     * POST /api/todos
     * 新しい Todo を作成して保存し、作成された DTO を返す
     */
    static async create(c: Context) {
        try {
            const body = (await c.req.json()) as {
                title: string;
                reminderAt?: string | null;
                dueAt?: string | null;
                reminderOffset?: number | null;
            };

            const id = uuidv4();
            const todoEntity = TodoEntity.createNew(id, body.title);

            if (body.reminderAt !== undefined)     todoEntity.changeReminder(body.reminderAt ? new Date(body.reminderAt) : null);
            if (body.dueAt !== undefined)          todoEntity.changeDue(body.dueAt ? new Date(body.dueAt) : null);
            if (body.reminderOffset !== undefined) todoEntity.changeReminderOffset(body.reminderOffset);

            await repo.save(todoEntity);

            return c.json<TodoResponseDto>(
                {
                    id: todoEntity.id,
                    title: todoEntity.title,
                    completed: todoEntity.completed ? 1 : 0,
                    createdAt: todoEntity.createdAt.toISOString(),
                    updatedAt: todoEntity.updatedAt.toISOString(),
                    reminderAt:     todoEntity.reminderAt    ? todoEntity.reminderAt.toISOString()    : null,
                    dueAt:          todoEntity.dueAt         ? todoEntity.dueAt.toISOString()         : null,
                    reminderOffset: todoEntity.reminderOffset ?? null,
                    reminded:       todoEntity.reminded       ? 1 : 0,
                },
                201
            );
        } catch (err) {
            console.error("Failed to create todo:", err);
            if (err instanceof Error && err.message.includes("タイトル")) {
                return c.json({ message: err.message }, 400);
            }
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }

    /**
     * PUT /api/todos/:id
     * 指定 ID の Todo を更新し、更新後の DTO を返す
     */
    static async update(c: Context) {
        try {
            const id = c.req.param("id");
            const body = (await c.req.json()) as {
                title?: string;
                completed?: boolean;
                reminderAt?: string | null;
                dueAt?: string | null;
                reminderOffset?: number | null;
            };

            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            if (typeof body.title === "string") {
                existing.changeTitle(body.title.trim());
            }
            if (body.completed === true && !existing.completed) {
                existing.complete();
            }
            if (body.reminderAt !== undefined)     existing.changeReminder(body.reminderAt ? new Date(body.reminderAt) : null);
            if (body.dueAt !== undefined)          existing.changeDue(body.dueAt ? new Date(body.dueAt) : null);
            if (body.reminderOffset !== undefined) existing.changeReminderOffset(body.reminderOffset);

            await repo.save(existing);

            const dto: TodoResponseDto = {
                id: existing.id,
                title: existing.title,
                completed: existing.completed ? 1 : 0,
                createdAt: existing.createdAt.toISOString(),
                updatedAt: existing.updatedAt.toISOString(),
                reminderAt:     existing.reminderAt    ? existing.reminderAt.toISOString()    : null,
                dueAt:          existing.dueAt         ? existing.dueAt.toISOString()         : null,
                reminderOffset: existing.reminderOffset ?? null,
                reminded:       existing.reminded       ? 1 : 0,
            };

            return c.json(dto);
        } catch (err) {
            console.error("Failed to update todo:", err);
            if (err instanceof Error && err.message.includes("タイトル")) {
                return c.json({ message: err.message }, 400);
            }
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }

    /**
     * PATCH /api/todos/:id
     * 期限・リマインダー設定のみ更新
     */
    static async patchDateSettings(c: Context) {
        try {
            const id = c.req.param("id");
            const body = (await c.req.json()) as {
                reminderAt?: string | null;
                dueAt?: string | null;
                reminderOffset?: number | null;
            };

            const todo = await repo.findById(id);
            if (!todo) {
                return c.json({ message: "Not Found" }, 404);
            }

            if (body.reminderAt !== undefined)     todo.changeReminder(body.reminderAt ? new Date(body.reminderAt) : null);
            if (body.dueAt !== undefined)          todo.changeDue(body.dueAt ? new Date(body.dueAt) : null);
            if (body.reminderOffset !== undefined) todo.changeReminderOffset(body.reminderOffset);

            await repo.save(todo);

            return c.json({
                reminderAt:     todo.reminderAt    ? todo.reminderAt.toISOString()    : null,
                dueAt:          todo.dueAt         ? todo.dueAt.toISOString()         : null,
                reminderOffset: todo.reminderOffset ?? null,
                reminded:       todo.reminded      ? 1 : 0,
            });
        } catch (err) {
            console.error("Failed to patch date settings:", err);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }

    /**
     * DELETE /api/todos/:id
     * 指定 ID の Todo を削除し、204 を返す
     */
    static async deleteById(c: Context) {
        try {
            const id = c.req.param("id");
            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            await repo.deleteById(id);
            return new Response(null, { status: 204 });
        } catch (err) {
            console.error("Failed to delete todo:", err);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }
}
