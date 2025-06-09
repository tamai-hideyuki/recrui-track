export type Todo = {
    id: string;
    title: string;
    completed: 0 | 1;
    createdAt: string;          // ISO-8601
    updatedAt: string;          // ISO-8601
    reminderAt: string | null;  // ISO-8601
    dueAt: string | null;       // ISO-8601
    reminderOffset: number | null; // 秒数
    reminded: boolean;          // 通知済みフラグ
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    return res.json();
}

/**
 * 全 Todo を取得
 */
export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${BASE_URL}/api/todos`);
    return handleResponse<Todo[]>(res);
}

/**
 * 新規 Todo を作成
 */
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

/**
 * 既存 Todo を更新
 * @param reminded この更新で通知済みにする場合は true、未通知にリセットする場合は false
 * @param id           更新する Todo の ID
 * @param newTitle     新しいタイトル文字列
 * @param completed    完了済みにするなら true
 * @param dueAt        期限日時 (ISO 文字列) / 省略で更新しない
 * @param reminderOffset リマインダーオフセット (秒数) / 省略で更新しない
 * @param reminded     通知済みにリセットするなら false、済にするなら true
 */
export async function updateTodo(
    id: string,
    newTitle: string,
    completed: boolean,
    dueAt?: string | null,
    reminderOffset?: number | null,
    reminded?: boolean
): Promise<Todo> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: newTitle,
            completed,
            dueAt,
            reminderOffset,
            reminded,
        }),
    });
    return handleResponse<Todo>(res);
}

/**
 * Todo を削除
 */
export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error(`deleteTodo failed: ${res.status}`);
}
