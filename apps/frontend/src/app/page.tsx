"use client";

import { useEffect, useState } from "react";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  type Todo,
} from "@/lib/api";

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
  return `${days ? `${days}日` : ""}${hours ? `${hours}時間` : ""}${
      mins ? `${mins}分` : ""
  }`;
}

type Filter = "all" | "today" | "week" | "overdue";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDueAt, setNewDueAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 編集モード用 state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueAt, setEditDueAt] = useState<string | null>(null);

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

  // 新規追加
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

  // 完了トグル
  const handleToggle = async (t: Todo) => {
    try {
      const updated = await updateTodo(
          t.id,
          t.title,
          !t.completed,
          t.dueAt
      );
      setTodos((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // 編集モード開始
  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDueAt(t.dueAt ? new Date(t.dueAt).toISOString().slice(0, 16) : null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDueAt(null);
  };

  // 保存（タイトル・期限編集＋完了／通知リセット）
  const saveEdit = async () => {
    if (!editingId) return;
    const original = todos.find((todo) => todo.id === editingId);
    if (!original) return;

    // 未来締切か判定
    const nowTs = Date.now();
    const dueFuture = editDueAt
        ? new Date(`${editDueAt}:00`).getTime() > nowTs
        : original.dueAt
            ? new Date(original.dueAt).getTime() > nowTs
            : false;

    // API呼び出し用 completed フラグ（boolean）
    const apiCompleted = dueFuture ? false : Boolean(original.completed);

    try {
      const updated = await updateTodo(
          editingId,
          editTitle.trim(),
          apiCompleted,
          editDueAt ? toTokyoISOString(editDueAt) : null
      );

      // UI state 更新時は 0|1 にキャスト
      setTodos((prev) =>
          prev.map((t) => {
            if (t.id !== updated.id) return t;
            return {
              ...updated,
              completed: apiCompleted ? 1 : 0,
              reminded: dueFuture ? false : updated.reminded,
            };
          })
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      // 保存処理後は必ず編集モードを閉じる
      cancelEdit();
    }
  };

  // --- 以下、フィルタ／JSX は saveEdit の外側に ---
  // フィルタ用日時レンジ
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const startDay = startOfToday.getDay();
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - startDay) + 1);

  // フィルタ本体
  const filtered = todos.filter((t) => {
    if (!t.dueAt) return filter === "all";
    const dueTs = new Date(t.dueAt).getTime();
    const fromTs = startOfToday.getTime();
    const toTodayTs = endOfToday.getTime();
    const toWeekTs = endOfWeek.getTime();
    const nowTs2 = now.getTime();

    switch (filter) {
      case "today":
        return dueTs >= fromTs && dueTs < toTodayTs;
      case "week":
        return dueTs >= fromTs && dueTs < toWeekTs;
      case "overdue":
        return dueTs < nowTs2;
      default:
        return true;
    }
  });

  return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">RecruiTrack ToDo</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* フィルタ & 追加フォーム */}
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
          <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={handleAdd}>
            Add
          </button>
        </div>

        {/* Todo 一覧 */}
        <ul>
          {filtered.map((t) => {
            const isOverdue = t.dueAt !== null && new Date(t.dueAt).getTime() < now.getTime();
            const dueMs = t.dueAt ? new Date(t.dueAt).getTime() - now.getTime() : 0;

            // 編集モード
            if (editingId === t.id) {
              return (
                  <li key={t.id} className="mb-2 p-2 border rounded bg-black text-white">
                    <input
                        type="text"
                        className="w-full bg-gray-800 text-white border-gray-700 px-2 py-1 mb-2 placeholder-gray-400"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        className="w-full bg-gray-800 text-white border-gray-700 px-2 py-1 mb-2"
                        value={editDueAt ?? ""}
                        onChange={(e) => setEditDueAt(e.target.value || null)}
                    />
                    <div className="flex space-x-2">
                      <button className="bg-white text-black px-3 py-1 rounded" onClick={saveEdit}>
                        Save
                      </button>
                      <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </li>
              );
            }

            // 通常表示モード
            return (
                <li
                    key={t.id}
                    className={`flex items-center justify-between mb-2 p-2 border rounded ${
                        isOverdue ? "border-red-500" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={Boolean(t.completed)} onChange={() => handleToggle(t)} />
                    <span className={`${t.completed ? "line-through text-gray-500" : ""}`}>{t.title}</span>
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
                      <button className="text-blue-500" onClick={() => startEdit(t)}>
                        Edit
                      </button>
                      <button className="text-red-500" onClick={() => handleDelete(t.id)}>
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
            );
          })}
        </ul>
      </div>
  );
}
