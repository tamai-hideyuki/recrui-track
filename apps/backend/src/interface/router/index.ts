import { Hono } from "hono";
import todoRouter from "./todos";
import companyRouter from "./companies";

const router = new Hono();
router.route("/api", todoRouter);
router.route("/api", companyRouter);

export { router };
