"use client";

import { useEffect, useState } from "react";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib";
import type { Todo } from "@/types/todo";

/** ローカル日時文字列 → JST(+09:00) → UTC ISO-8601 に変換 */
function toTokyoISOString(localDatetime: string): string {
  const [d, t] = localDatetime.split("T");
  return new Date(`${d}T${t}:00+09:00`).toISOString();
}

/** 残り時間を「X日Y時間Z分」のフォーマットで返す */
function formatRemaining(ms: number): string {
  if (ms <= 0) return "期限超過";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return `${days ? `${days}日` : ""}${hours ? `${hours}時間` : ""}${mins ? `${mins}分` : ""}`;
}

type Filter = "all" | "today" | "week" | "overdue";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDueAt, setNewDueAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── ここから編集モード用ハンドラ ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueAt, setEditDueAt] = useState<string | null>(null);

  /** 編集モード開始 */
  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDueAt(t.dueAt ? new Date(t.dueAt).toISOString().slice(0, 16) : null);
  };

  /** 編集キャンセル */
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDueAt(null);
  };

  /** 編集保存 */
   const saveEdit = async () => {
       if (!editingId) return;
       const original = todos.find((t) => t.id === editingId);
       if (!original) return;

           try {
           const updated = await updateTodo(
                 editingId,
                 editTitle.trim(),
                 // 完了/通知フラグのリセットロジック
                     Boolean(original.completed),
                 editDueAt ? toTokyoISOString(editDueAt) : null,
                 Boolean(original.reminded)
               );
           // state を更新して編集モード解除
               setTodos((prev) =>
                     prev.map((t) =>
                           t.id === updated.id
                             ? {
                                     ...updated,
                         completed: Boolean(updated.completed),
                         reminded: Boolean(updated.reminded),
                         dueAt: updated.dueAt ? new Date(updated.dueAt) : undefined,
                       }
                 : t
             )
           );
           cancelEdit();
         } catch (e) {
           setError((e as Error).message);
         }
     };

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
          t.dueAt ? t.dueAt.toISOString() : null,
          t.reminded ?? false
      );
      setTodos((prev) =>
          prev.map((x) => (x.id === updated.id ? { ...updated, completed: Boolean(updated.completed), reminded: Boolean(updated.reminded), dueAt: updated.dueAt ? new Date(updated.dueAt) : undefined } : x))
      );
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

  return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">RecruiTrack ToDo</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* フィルタ + 追加フォーム */}
        <div className="flex space-x-2 mb-4">
          {(["all", "today", "week", "overdue"] as Filter[]).map((f) => (
              <button
                  key={f}
                  className={`px-3 py-1 rounded ${
                      filter === f ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
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
        {/* タスク追加フォーム */}
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

        {/* Todo 一覧 */}
        <ul>
          {todos
              .filter((t) => {
                const now = Date.now();
                if (!t.dueAt) return filter === "all";
                const dueTs = new Date(t.dueAt).getTime();
                switch (filter) {
                  case "today":
                    // 今日中フィルタ
                    const start = new Date();
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setDate(end.getDate() + 1);
                    return dueTs >= start.getTime() && dueTs < end.getTime();
                  case "week":
                    // 今週中フィルタ
                    const weekStart = new Date();
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + (6 - weekStart.getDay()) + 1);
                    return dueTs >= weekStart.getTime() && dueTs < weekEnd.getTime();
                  case "overdue":
                    // 期限切れフィルタ
                    return dueTs < now;
                  default:
                    return true;
                }
              })
              .map((t) => {
                const now = Date.now();
                const isOverdue = t.dueAt ? new Date(t.dueAt).getTime() < now : false;
                const dueMs = t.dueAt ? new Date(t.dueAt).getTime() - now : 0;

                // ─── 編集モードかどうかで分岐 ───
                if (editingId === t.id) {
                  return (
                      <li key={t.id} className="mb-2 p-2 border rounded bg-black text-white">
                        {/* 編集モード用のフォーム */}
                        <input
                            type="text"
                            className="w-full mb-2 px-2 py-1"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            className="w-full mb-2 px-2 py-1"
                            value={editDueAt ?? ""}
                            onChange={(e) => setEditDueAt(e.target.value || null)}
                        />
                        <div className="flex space-x-2">
                          <button
                              className="bg-white text-black px-3 py-1 rounded"
                              onClick={() => saveEdit()}
                          >
                            Save
                          </button>
                          <button
                              className="bg-gray-700 text-white px-3 py-1 rounded"
                              onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                  );
                }

                // ─── 通常表示モード ───
                return (
                    <li
                        key={t.id}
                        className={`flex items-center justify-between mb-2 p-2 border rounded ${
                            isOverdue ? "border-red-500" : "border-gray-200"
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={Boolean(t.completed)}
                            onChange={() => handleToggle(t)}
                        />
                        <span className={t.completed ? "line-through text-gray-500" : ""}>
              {t.title}
            </span>
                      </div>

                      <div className="text-right text-sm space-y-1">
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
                        <div className="flex space-x-2 mt-1 justify-end">
                          <button
                              className="text-blue-500"
                              onClick={() => startEdit(t)}
                          >
                            Edit
                          </button>
                          <button
                              className="text-red-500"
                              onClick={() => handleDelete(t.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                );
              })}
        </ul>


        {/* 以下、省略 */}
      </div>
  );
}
