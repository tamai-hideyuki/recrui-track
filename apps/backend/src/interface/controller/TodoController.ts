import { Context } from "hono";
import { CreateTodoUseCase } from "../../application/usecase/CreateTodoUseCase";
import { GetAllTodosUseCase } from "../../application/usecase/GetAllTodosUseCase";
import { GetTodoByIdUseCase } from "../../application/usecase/GetTodoByIdUseCase";
import { UpdateTodoUseCase } from "../../application/usecase/UpdateTodoUseCase";
import { DeleteTodoUseCase } from "../../application/usecase/DeleteTodoUseCase";
import { DrizzleTodoRepository } from "../../infrastructure/repository/DrizzleTodoRepository";
import { ValidationError, NotFoundError } from "../../shared/errors";

const todoRepo = new DrizzleTodoRepository();

export class TodoController {
    static async getAll(c: Context) {
        try {
            const useCase = new GetAllTodosUseCase(todoRepo);
            const output = await useCase.execute();
            return c.json(output);
        } catch (err: any) {
            return c.json({ message: err.message }, 500);
        }
    }

    static async getById(c: Context) {
        try {
            const id = c.req.param("id");
            const useCase = new GetTodoByIdUseCase(todoRepo);
            const output = await useCase.execute(id);
            return c.json(output);
        } catch (err: any) {
            if (err instanceof NotFoundError) {
                return c.json({ message: err.message }, 404);
            }
            return c.json({ message: err.message }, 500);
        }
    }

    static async create(c: Context) {
        try {
            const { title } = await c.req.json<{ title: string }>();
            const useCase = new CreateTodoUseCase(todoRepo);
            const { id } = await useCase.execute({ title });
            return c.json({ id }, 201);
        } catch (err: any) {
            if (err instanceof ValidationError) {
                return c.json({ message: err.message }, 400);
            }
            return c.json({ message: err.message }, 500);
        }
    }

    static async update(c: Context) {
        try {
            const id = c.req.param("id");
            const { title, completed } = await c.req.json<{
                title: string;
                completed: boolean;
            }>();
            const useCase = new UpdateTodoUseCase(todoRepo);
            const result = await useCase.execute({ id, title, completed });
            return c.json(result);
        } catch (err: any) {
            if (err instanceof NotFoundError) {
                return c.json({ message: err.message }, 404);
            }
            if (err instanceof ValidationError) {
                return c.json({ message: err.message }, 400);
            }
            return c.json({ message: err.message }, 500);
        }
    }

    static async delete(c: Context) {
        try {
            const id = c.req.param("id");
            const useCase = new DeleteTodoUseCase(todoRepo);
            await useCase.execute(id);
            return c.json({ message: "deleted" });
        } catch (err: any) {
            if (err instanceof NotFoundError) {
                return c.json({ message: err.message }, 404);
            }
            return c.json({ message: err.message }, 500);
        }
    }
}
