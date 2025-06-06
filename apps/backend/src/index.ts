import "dotenv/config";
import { Hono } from "hono";
import http from "http";

const app = new Hono();

app.get("/", (c) => c.text("Hello RecruiTrack!"));

//    app.use("/api", router);

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(
    // @ts-ignore: 型チェックを無視して Hono の fetch を渡す
    app.fetch
);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
