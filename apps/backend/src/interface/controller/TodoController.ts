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
            // ① ドメインエンティティ TodoEntity[] を取得
            const todos: TodoEntity[] = await repo.findAll();

            // ② DTO にマッピング
            const result: TodoResponseDto[] = todos.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed ? 1 : 0,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            }));

            // ③ JSON レスポンスとして返却
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
            // ① ドメインエンティティを取得
            const todoEntity = await repo.findById(id);

            if (!todoEntity) {
                return c.json({ message: "Not Found" }, 404);
            }

            // ② DTO にマッピング
            const dto: TodoResponseDto = {
                id: todoEntity.id,
                title: todoEntity.title,
                completed: todoEntity.completed ? 1 : 0,
                createdAt: todoEntity.createdAt.toISOString(),
                updatedAt: todoEntity.updatedAt.toISOString(),
            };

            // ③ JSON レスポンスとして返却
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
            // ① リクエストボディ（{ title: string }）を取得
            const body = (await c.req.json()) as { title: string };

            // ② UUID を生成し、ドメインエンティティを作成
            const id = uuidv4();
            const todoEntity = TodoEntity.createNew(id, body.title);

            // ③ リポジトリに保存
            await repo.save(todoEntity);

            // ④ 作成したエンティティを DTO にマッピングして返却（ステータス 201）
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

            // ① 既存エンティティを取得
            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            // ② ドメインモデルのメソッドを用いて更新
            if (typeof body.title === "string") {
                existing.changeTitle(body.title.trim());
            }
            if (body.completed === true && !existing.completed) {
                existing.complete();
            }

            // ③ 更新後のエンティティを保存
            await repo.save(existing);

            // ④ 更新後エンティティを DTO にマッピングして返却
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

            // 例えばタイトル変更時のバリデーションエラーなどを 400 で返す
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

            // ① 既存エンティティを取得して存在確認
            const existing = await repo.findById(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, 404);
            }

            // ② 削除処理
            await repo.deleteById(id);

            // ③ 成功したら 204 No Content
            return c.text("", { status: 204 });
        } catch (err) {
            console.error("Failed to delete todo:", err);
            return c.json({ message: "Internal Server Error" }, 500);
        }
    }
}
