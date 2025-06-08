import { TodoOutput } from "../dto/TodoOutput";
import { NotFoundError } from "../../shared/errors";
import {TodoRepositoryPort} from "../port/TodoRepositoryPort";

export class GetTodoByIdUseCase {
    constructor(private readonly repo: TodoRepositoryPort) {}

    async execute(id: string): Promise<TodoOutput> {
        const t = await this.repo.findById(id);
        if (!t) throw new NotFoundError(`Todo ${id} が見つかりません`);
        return {
            id: t.id,
            title: t.title,
            completed: t.completed,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            reminderAt:     t.reminderAt    ? t.reminderAt.toISOString()    : null,
            dueAt:          t.dueAt         ? t.dueAt.toISOString()         : null,
            reminderOffset: t.reminderOffset ?? null,
            reminded:       t.reminded,
        };
    }
}
