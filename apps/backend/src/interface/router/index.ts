import { Hono } from "hono";
import todoRouter    from "./todos";
import companyRouter from "./companies";

const router = new Hono();

// /api/todos/* を todos.ts 側へ
router.route("/api", todoRouter);

// /api/companies/* を companies.ts 側へ
router.route("/api", companyRouter);

export default router;
