import { TodoRepositoryPort } from "../port/TodoRepositoryPort";
import { TodoOutput } from "../dto/TodoOutput";

export class GetAllTodosUseCase {
    constructor(private readonly todoRepo: TodoRepositoryPort) {}

    public async execute(): Promise<TodoOutput[]> {
        const todos = await this.todoRepo.findAll();
        return todos.map((t) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        }));
    }
}
