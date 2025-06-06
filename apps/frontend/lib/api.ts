import { Todo } from "../types/todo";

const BASE_PATH = "/api/todos";

export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(BASE_PATH);
    if (!res.ok) throw new Error("Failed to fetch todos");
    return res.json();
}

export async function createTodo(title: string): Promise<void> {
    const res = await fetch(BASE_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create todo");
}

export async function updateTodo(
    id: string,
    updated: { title: string; completed: 0 | 1 }
): Promise<void> {
    const res = await fetch(`${BASE_PATH}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error("Failed to update todo");
}

export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE_PATH}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete todo");
}
