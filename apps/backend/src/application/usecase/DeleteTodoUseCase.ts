import { TodoRepositoryPort } from "../port/TodoRepositoryPort";

export class DeleteTodoUseCase {
    constructor(private readonly todoRepo: TodoRepositoryPort) {}

    public async execute(id: string): Promise<void> {
        const existing = await this.todoRepo.findById(id);
        if (!existing) {
            throw new Error("Todo が見つかりません");
        }
        await this.todoRepo.deleteById(id);
    }
}
