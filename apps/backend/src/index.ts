import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { router } from "./interface/router";

const app = new Hono();

app.use("/api/*", cors());

app.use("*", async (c, next) => {
    try {
        return await next();
    } catch (err) {
        console.error("Internal Error:", err);
        return c.text("Internal Server Error", 500);
    }
});

app.route("/api", router);

app.get("/", (c) => c.text("Hello RecruiTrack!"));

app.all("*", (c) => c.text("404 - Page Not Found", 404));

const PORT = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port: PORT });
console.log(`Server is running on http://localhost:${PORT}`);
