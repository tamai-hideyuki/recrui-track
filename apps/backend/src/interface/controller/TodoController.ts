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
    static async getAll(c: Context) {
        try {
            // ドメインエンティティ TodoEntity[] を取得
            const todos: TodoEntity[] = await repo.findAll();

            // DTO にマッピング
            const result: TodoResponseDto[] = todos.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed ? 1 : 0,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            }));

            // JSON レスポンスとして返却
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
            // ドメインエンティティを取得
            const todoEntity = await repo.findById(id);

            if (!todoEntity) {
                return c.json({ message: "Not Found" }, 404);
            }

            // DTO にマッピング
            const dto: TodoResponseDto = {
                id: todoEntity.id,
                title: todoEntity.title,
                completed: todoEntity.completed ? 1 : 0,
                createdAt: todoEntity.createdAt.toISOString(),
                updatedAt: todoEntity.updatedAt.toISOString(),
            };

            // JSON レスポンスとして返却
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
            // リクエストボディ（{ title: string }）を取得
            const body = (await c.req.json()) as { title: string };

            // UUID を生成し、ドメインエンティティを作成
            const id = uuidv4();
            const todoEntity = TodoEntity.createNew(id, body.title);

            // リポジトリに保存
            await repo.save(todoEntity);

            // 作成したエンティティを DTO にマッピングして返却（ステータス 201）
            return c.json(
                {
                    id: todoEntity.id,
                    title: todoEntity.title,
                    completed: todoEntity.completed ? 1 : 0,
                    createdAt: todoEntity.createdAt.toISOString(),
                    updatedAt: todoEntity.updatedAt.toISOString(),
                },
                201
            );
        } catch (err) {
            console.error("Failed to create todo:", err);

            // タイトルがバリューオブジェクトで検証に失敗した場合は 400 を返す
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
            };

            // 既存エンティティを取得
            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            // ドメインモデルのメソッドを用いて更新
            if (typeof body.title === "string") {
                existing.changeTitle(body.title.trim());
            }
            if (body.completed === true && !existing.completed) {
                existing.complete();
            }

            // 更新後のエンティティを保存
            await repo.save(existing);

            // 更新後エンティティを DTO にマッピングして返却
            const dto: TodoResponseDto = {
                id: existing.id,
                title: existing.title,
                completed: existing.completed ? 1 : 0,
                createdAt: existing.createdAt.toISOString(),
                updatedAt: existing.updatedAt.toISOString(),
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
     * DELETE /api/todos/:id
     * 指定 ID の Todo を削除し、204 を返す
     */
    static async deleteById(c: Context) {
        try {
            const id = c.req.param("id");

            // 既存エンティティを取得して存在確認
            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            // 削除処理
            await repo.deleteById(id);

            // 成功したら 204 No Content
            return new Response(null, { status: 204 });
        } catch (err) {
            console.error("Failed to delete todo:", err);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }
}
