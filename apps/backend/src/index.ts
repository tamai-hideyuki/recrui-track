import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { router } from "./interface/router";

const app = new Hono();

// ① /api/* に対して CORS を許可
app.use("/api/*", cors());

// ② 全ルート共通のエラーハンドリング
app.use("*", async (c, next) => {
    try {
        return await next();
    } catch (err) {
        console.error("Internal Error:", err);
        return c.text("Internal Server Error", 500);
    }
});

// ③ /api/* をサブルーター（router）に渡す
app.route("/api/*", router);

// ④ ルートパス "/" は挨拶だけ
app.get("/", (c) => c.text("Hello RecruiTrack!"));

// ⑤ それ以外は 404
app.all("*", (c) => c.text("404 - Page Not Found", 404));

const PORT = Number(process.env.PORT ?? 3000);
serve({
    fetch: app.fetch,
    port: PORT,
});
console.log(`Server is running on http://localhost:${PORT}`);
