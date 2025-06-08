export type Todo = {
    id: string;
    title: string;
    completed: 0 | 1;
    createdAt: string;
    updatedAt: string;
    reminderAt: string | null;
};



const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${BASE_URL}/api/todos`);
    if (!res.ok) {
        throw new Error(`fetchTodos failed: ${res.status}`);
    }
    return await res.json();
}

    export async function createTodo(
    title: string,
        reminderAt: string | null
): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/api/todos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reminderAt }),
        });
    if (!res.ok) {
        throw new Error(`createTodo failed: ${res.status}`);
    }
    return await res.json();
}


    export async function updateTodo(
    id: string,
        newTitle: string,
        completed: boolean,
        reminderAt: string | null
): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, completed, reminderAt }),
        });
    if (!res.ok) {
        throw new Error(`updateTodo failed: ${res.status}`);
    }
    return await res.json();
}

export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error(`deleteTodo failed: ${res.status}`);
    }
}
