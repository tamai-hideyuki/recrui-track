import { Hono } from "hono";
import { TodoController } from "../controller/TodoController";

export const app = new Hono();

app.get("/api/todos", TodoController.getAll);
app.get("/api/todos/:id", TodoController.getById);
app.post("/api/todos", TodoController.create);
app.put("/api/todos/:id", TodoController.update);
app.delete("/api/todos/:id", TodoController.delete);
