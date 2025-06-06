// apps/frontend/pages/index.tsx

import { useEffect, useState } from "react";
import {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
} from "../lib/api";
import { Todo } from "../types/todo";

export default function Home(): JSX.Element {
    // ToDo のリストを state で持つ
    const [todos, setTodos] = useState<Todo[]>([]);
    const [title, setTitle] = useState("");

    // ページロード時に ToDo を読み込む
    useEffect(() => {
        loadTodos();
    }, []);

    async function loadTodos() {
        try {
            const data = await fetchTodos();
            setTodos(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!title.trim()) return;
        // バックエンドに POST
        await createTodo(title.trim());
        setTitle("");        // フォームをクリア
        await loadTodos();   // 再読み込み
    }

    async function toggleComplete(todo: Todo) {
        // completed が 0 or 1 なので、チェックボックスの更新を boolean → 0/1 に変換
        const newCompleted: 0 | 1 = todo.completed === 1 ? 0 : 1;
        await updateTodo(todo.id, {
            title: todo.title,
            completed: newCompleted,
        });
        await loadTodos();
    }

    async function handleDelete(todo: Todo) {
        await deleteTodo(todo.id);
        await loadTodos();
    }

    return (
        <main className="px-4 py-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">RecruiTrack Lite</h1>

            <form onSubmit={handleCreate} className="flex mb-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New ToDo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="px-4 bg-blue-600 text-white rounded ml-2"
                >
                    追加
                </button>
            </form>

            <ul>
                {todos.map((todo: Todo) => (
                    <li
                        key={todo.id}
                        className="flex items-center mb-2 hover:bg-gray-50 p-2 rounded"
                    >
                        {/* ① チェックボックスの checked には boolean を渡す */}
                        <input
                            type="checkbox"
                            checked={todo.completed === 1}
                            onChange={() => toggleComplete(todo)}
                            className="mr-2"
                        />

                        {/* ② 完了済みなら取り消し線をつける */}
                        <span
                            className={
                                todo.completed === 1
                                    ? "line-through text-gray-500 flex-1"
                                    : "flex-1"
                            }
                        >
              {todo.title}
            </span>

                        <button
                            onClick={() => handleDelete(todo)}
                            className="ml-auto text-red-500 hover:underline"
                        >
                            削除
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
