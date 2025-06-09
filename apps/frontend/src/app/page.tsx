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
 * ローカル日時文字列 → JST(+09:00) → UTC ISO-8601 に変換
 */
function toTokyoISOString(localDatetime: string): string {
  const [d, t] = localDatetime.split("T");
  return new Date(`${d}T${t}:00+09:00`).toISOString();
}

/**
 * 残り時間を「X日Y時間Z分」のフォーマットで返す
 */
function formatRemaining(ms: number): string {
  if (ms <= 0) return "期限超過";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return `${days ? `${days}日` : ""}${hours ? `${hours}時間` : ""}${
      mins ? `${mins}分` : ""
  }`;
}

// フィルタ種別
type Filter = "all" | "today" | "week" | "overdue";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDueAt, setNewDueAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 初回一覧取得
  useEffect(() => {
    (async () => {
      try {
        setTodos(await fetchTodos());
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  const handleAdd = async () => {
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
      setError((e as Error).message);
    }
  };

  const handleToggle = async (t: Todo) => {
    try {
      const updated = await updateTodo(
          t.id,
          t.title,
          !t.completed,
          t.dueAt
      );
      setTodos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // フィルタ適用
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const endOfWeek = new Date(startOfToday);
  // 日本では週の始まりを日曜とすると、日曜0→土曜6
  const day = startOfToday.getDay();
  const daysToSat = 6 - day;
  endOfWeek.setDate(endOfWeek.getDate() + daysToSat + 1);

  const filtered = todos.filter((t) => {
    if (!t.dueAt) return filter === "all";
    const due = new Date(t.dueAt);
    switch (filter) {
      case "today":
        return due >= startOfToday && due < endOfToday;
      case "week":
        return due >= startOfToday && due < endOfWeek;
      case "overdue":
        return due < now;
      default:
        return true;
    }
  });

  return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">RecruiTrack ToDo</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* フィルタ */}
        <div className="flex space-x-2 mb-4">
          {(["all", "today", "week", "overdue"] as Filter[]).map((f) => (
              <button
                  key={f}
                  className={`px-3 py-1 rounded ${
                      filter === f
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setFilter(f)}
              >
                {f === "all"
                    ? "全件"
                    : f === "today"
                        ? "今日中"
                        : f === "week"
                            ? "今週中"
                            : "期限切れ"}
              </button>
          ))}
        </div>

        {/* 新規作成フォーム */}
        <div className="flex mb-4 space-x-2">
          <input
              type="text"
              placeholder="Title"
              className="flex-1 border rounded px-2 py-1"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
              type="datetime-local"
              className="border rounded px-2 py-1"
              value={newDueAt ?? ""}
              onChange={(e) => setNewDueAt(e.target.value || null)}
          />
          <button
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={handleAdd}
          >
            Add
          </button>
        </div>

        {/* 一覧 */}
        <ul>
          {filtered.map((t) => {
            const dueMs = t.dueAt ? new Date(t.dueAt).getTime() - now.getTime() : 0;
            return (
                <li
                    key={t.id}
                    className="flex items-center justify-between mb-2 p-2 border rounded"
                >
                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={Boolean(t.completed)}
                        onChange={() => handleToggle(t)}
                    />
                    <span
                        className={`${
                            t.completed ? "line-through text-gray-500" : ""
                        }`}
                    >
                  {t.title}
                </span>
                  </div>
                  <div className="text-right text-sm">
                    {t.dueAt ? (
                        <>
                          <div>期限: {new Date(t.dueAt).toLocaleString()}</div>
                          <div>残り: {formatRemaining(dueMs)}</div>
                          <div>
                            通知:{" "}
                            {t.reminded ? (
                                <span className="text-green-600">済み</span>
                            ) : (
                                <span className="text-red-600">未</span>
                            )}
                          </div>
                        </>
                    ) : (
                        <div className="text-gray-500">期限なし</div>
                    )}
                    <button
                        className="text-red-500 mt-1"
                        onClick={() => handleDelete(t.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
            );
          })}
        </ul>
      </div>
  );
}
