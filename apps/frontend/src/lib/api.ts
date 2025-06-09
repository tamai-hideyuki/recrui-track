export type Todo = {
    id: string;
    title: string;
    completed: 0 | 1;
    createdAt: string;        // ISO-8601
    updatedAt: string;        // ISO-8601
    reminderAt: string | null;    // ISO-8601
    dueAt: string | null;         // ISO-8601
    reminderOffset: number | null; // 秒数
    reminded: boolean;             // 通知済みフラグ
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    return res.json();
}

export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${BASE_URL}/api/todos`);
    return handleResponse<Todo[]>(res);
}

export async function createTodo(
    title: string,
    dueAt?: string | null,
    reminderOffset?: number | null
): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueAt, reminderOffset }),
    });
    return handleResponse<Todo>(res);
}

export async function updateTodo(
    id: string,
    newTitle: string,
    completed: boolean,
    dueAt?: string | null,
    reminderOffset?: number | null
): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, completed, dueAt, reminderOffset }),
    });
    return handleResponse<Todo>(res);
}

export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error(`deleteTodo failed: ${res.status}`);
}
