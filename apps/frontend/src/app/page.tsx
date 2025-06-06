"use client";

import { useEffect, useState } from "react";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  type Todo,
} from "@/lib/api";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 初回マウント時に一覧を取得
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTodos();
        setTodos(list);
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      }
    })();
  }, []);

  // 新規作成
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await createTodo(newTitle);
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    }
  };

  // 更新（タイトル変更 or 完了トグル）
  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await updateTodo(
          todo.id,
          todo.title,
          Boolean(todo.completed ^ 1) // 0⇄1 を反転
      );
      setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    }
  };

  return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">RecruiTrack ToDo</h1>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <div className="flex mb-4">
          <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              placeholder="New ToDo title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
              className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
              onClick={handleAdd}
          >
            Add
          </button>
        </div>
        {todos.length === 0 && <p>No ToDo items yet.</p>}
        <ul>
          {todos.map((t) => (
              <li key={t.id} className="flex items-center mb-2">
                <input
                    type="checkbox"
                    checked={t.completed === 1}
                    onChange={() => handleToggle(t)}
                    className="mr-2"
                />
                <span
                    className={
                        "flex-1 " + (t.completed === 1 ? "line-through text-gray-500" : "")
                    }
                >
              {t.title}
            </span>
                <button
                    className="ml-2 text-red-500"
                    onClick={() => handleDelete(t.id)}
                >
                  ✕
                </button>
              </li>
          ))}
        </ul>
      </div>
  );
}
