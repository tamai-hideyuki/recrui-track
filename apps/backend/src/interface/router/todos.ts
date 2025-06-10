import { Hono } from "hono";
import { TodoController } from "../controller/TodoController";

export const router = new Hono();

// (1) 全件取得（?filter=due-today|overdue|upcoming を受け取れるように）
router.get("/todos", (c) => {
    const filter = c.req.query("filter");
    return TodoController.getAll(c, filter);
});

// (2) 単一取得
router.get("/todos/:id", (c) => {
    return TodoController.getById(c);
});

// (3) 新規作成（body に dueAt, reminderOffset を受け取る）
router.post("/todos", (c) => {
    return TodoController.create(c);
});

// (4) 全体更新（タイトル・完了状態ほか全フィールド）
router.put("/todos/:id", (c) => {
    return TodoController.update(c);
});

// (5) 部分更新：期限・リマインダー設定のみ PATCH で更新
router.patch("/todos/:id", (c) => {
    return TodoController.patchDateSettings(c);
});

// (6) 削除
router.delete("/todos/:id", (c) => {
    return TodoController.deleteById(c);
});
