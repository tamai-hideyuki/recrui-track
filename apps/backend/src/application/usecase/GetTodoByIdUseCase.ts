import { TodoRepositoryPort } from "../port/TodoRepositoryPort";
import { TodoOutput } from "../dto/TodoOutput";

export class GetTodoByIdUseCase {
    constructor(private readonly todoRepo: TodoRepositoryPort) {}

    public async execute(id: string): Promise<TodoOutput> {
        const todo = await this.todoRepo.findById(id);
        if (!todo) {
            throw new Error("Todo が見つかりません");
        }
        return {
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
            createdAt: todo.createdAt.toISOString(),
            updatedAt: todo.updatedAt.toISOString(),
        };
    }
}
