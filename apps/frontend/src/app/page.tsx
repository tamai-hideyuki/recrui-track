"use client";

import { useEffect, useState } from "react";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  type Todo,
} from "@/lib/api";

/**
 * "YYYY-MM-DDThh:mm" → JST(+09:00) → UTC ISO-8601 文字列
 */
function toTokyoISOString(localDatetime: string): string {
  const [datePart, timePart] = localDatetime.split("T");
  const withSeconds = `${datePart}T${timePart}:00+09:00`;
  return new Date(withSeconds).toISOString();
}

/** 期日と現在時刻の差分で背景色を返す */
function getBgClass(todo: Todo): string {
  if (todo.completed) return "";
  if (!todo.dueAt) return "";
  const diffMs = new Date(todo.dueAt).getTime() - Date.now();
  if (diffMs <= 0) return "bg-red-100";
  if (diffMs <= 60 * 60 * 1000) return "bg-yellow-100";
  return "";
}

export default function HomePage() {
  const [todos, setTodos]       = useState<Todo[]>([]);
  const [, setTick]             = useState(0);              // 再レンダー用
  const [newTitle, setNewTitle] = useState("");
  const [newDueAt, setNewDueAt] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // 初回マウントで一覧取得
  useEffect(() => {
    (async () => {
      try {
        setTodos(await fetchTodos());
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      }
    })();
  }, []);

  // 1分ごとに再レンダーして色を更新
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // 新規作成
  const handleAdd = async (): Promise<void> => {
    if (!newTitle.trim()) return;
    try {
      const created = await createTodo(
          newTitle.trim(),
          newDueAt ? toTokyoISOString(newDueAt) : null
      );
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
      setNewDueAt(null);
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    }
  };

  // 完了トグル
  const handleToggle = async (todo: Todo): Promise<void> => {
    try {
      // dueAt はすでに ISO 文字列なので、そのまま渡す
      const updated = await updateTodo(
        todo.id,
        todo.title,
        !todo.completed,
        todo.dueAt,
        todo.reminderOffset
      );
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
        console.error(e);
        setError((e as Error).message);
      }
  };

  // 削除
  const handleDelete = async (id: string): Promise<void> => {
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

        {/* 入力フォーム */}
        <div className="flex flex-col mb-4 space-y-2">
          <input
              type="text"
              className="border rounded px-2 py-1"
              placeholder="New ToDo title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
              type="datetime-local"
              className="border rounded px-2 py-1"
              value={newDueAt ?? ""}
              onChange={(e) =>
                  setNewDueAt(e.target.value ? e.target.value : null)
              }
          />
          <button
              className="bg-blue-500 text-white px-4 py-1 rounded"
              onClick={handleAdd}
          >
            Add
          </button>
        </div>

        {/* リスト */}
        {todos.length === 0 ? (
            <p>No ToDo items yet.</p>
        ) : (
            <ul>
              {todos.map((t) => (
                  <li
                      key={t.id}
                      className={`flex items-center mb-2 space-x-2 p-2 rounded ${getBgClass(
                          t
                      )}`}
                  >
                    <input
                        type="checkbox"
                        checked={Boolean(t.completed)}
                        onChange={() => handleToggle(t)}
                        className="mr-2"
                    />
                    <div className="flex-1">
                      <p className={t.completed ? "line-through text-gray-500" : ""}>
                        {t.title}
                      </p>
                      {t.dueAt && (
                          <p className="text-sm text-gray-600">
                            Due: {new Date(t.dueAt).toLocaleString()}
                          </p>
                      )}
                    </div>
                    <button
                        className="text-red-500"
                        onClick={() => handleDelete(t.id)}
                    >
                      ✕
                    </button>
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
}
