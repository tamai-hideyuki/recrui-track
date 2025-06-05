import "dotenv/config";
import { Hono } from "hono";
import http from "http";

const app = new Hono();
app.get("/", (c) => c.text("Hello RecruiTrack!"));

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(
    // @ts-ignore: 型が Node の IncomingMessage/ServerResponse と合わないため無視
    app.fetch
);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
