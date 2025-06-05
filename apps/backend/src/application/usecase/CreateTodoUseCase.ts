import { CreateTodoInput } from "../dto/CreateTodoInput";
import { TodoRepositoryPort } from "../port/TodoRepositoryPort";
import { Todo } from "../../domain/entity/Todo";
import { nanoid } from "nanoid";

export class CreateTodoUseCase {
    constructor(private readonly todoRepo: TodoRepositoryPort) {}

    public async execute(input: CreateTodoInput): Promise<{ id: string }> {
        const id = nanoid();
        const todo = Todo.createNew(id, input.title);
        await this.todoRepo.save(todo);
        return { id };
    }
}
