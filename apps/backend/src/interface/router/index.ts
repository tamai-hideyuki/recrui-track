import { Hono } from "hono";
import { TodoController } from "../controller/TodoController";

export const router = new Hono();

// (1) 全件取得
router.get("/todos", (c) => {
    return TodoController.getAll(c);
});
// (2) 単一取得
router.get("/todos/:id", (c) => {
    return TodoController.getById(c);
});
// (3) 新規作成
router.post("/todos", (c) => {
    return TodoController.create(c);
});
// (4) 更新
router.put("/todos/:id", (c) => {
    return TodoController.update(c);
});
// (5) 削除
router.delete("/todos/:id", (c) => {
    return TodoController.deleteById(c);
});
