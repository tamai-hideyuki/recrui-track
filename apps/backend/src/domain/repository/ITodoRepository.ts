import { Todo } from "../entity/Todo";

export interface ITodoRepository {
    findAll(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    save(todo: Todo): Promise<void>;
    deleteById(id: string): Promise<void>;
}
