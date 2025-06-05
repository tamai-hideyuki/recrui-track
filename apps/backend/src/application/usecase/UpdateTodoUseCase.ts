import { UpdateTodoInput } from "../dto/UpdateTodoInput";
import { TodoRepositoryPort } from "../port/TodoRepositoryPort";

export class UpdateTodoUseCase {
    constructor(private readonly todoRepo: TodoRepositoryPort) {}

    public async execute(input: UpdateTodoInput): Promise<{ id: string }> {
        const existing = await this.todoRepo.findById(input.id);
        if (!existing) {
            throw new Error("Todo が見つかりません");
        }
        existing.changeTitle(input.title);
        if (input.completed && !existing.completed) {
            existing.complete();
        }
        await this.todoRepo.save(existing);
        return { id: existing.id };
    }
}
