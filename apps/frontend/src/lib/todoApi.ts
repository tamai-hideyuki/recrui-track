import { Todo } from "@/types/todo";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";
const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * 全 Todo 取得
 */
export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${BASE}/api/todos`);
    if (!res.ok) throw new Error("fetchTodos failed");
    return res.json();
}

/**
 * Todo 作成
 */
export async function createTodo(
    title: string,
    dueAt: string | null
): Promise<Todo> {
    const res = await fetch(`${BASE}/api/todos`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ title, dueAt }),
    });
    if (!res.ok) throw new Error("createTodo failed");
    return res.json();
}

/**
 * Todo 更新
 */
export async function updateTodo(
    id: string,
    title: string,
    completed: boolean,
    dueAt: string | null,
    reminded: boolean = false
): Promise<Todo> {
    // まず payload を定義
    const payload = {
        title,
        // API が 0/1 を期待しているなら数値化
        completed: completed ? 1 : 0,
        dueAt,
        // 同様に通知フラグ
        reminded: reminded ? 1 : 0,
    };

    const res = await fetch(`${BASE}/api/todos/${id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("updateTodo failed");
    return res.json();
}

/**
 * Todo 削除
 */
export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE}/api/todos/${id}`, {
        method: "DELETE",
    });
    if (res.status !== 204) throw new Error("deleteTodo failed");
}
