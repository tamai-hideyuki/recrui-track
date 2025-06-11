"use client";

import { useEffect, useState } from "react";
import {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
} from "@/lib";
import type { Todo } from "@/types/todo";

/* ──────── 共有ユーティリティ ──────── */

/** 文字列／Date／null → Date | undefined へ統一 */
function parseDueAt(value: string | Date | null | undefined): Date | undefined {
    if (!value) return undefined;
    return value instanceof Date ? value : new Date(value);
}

/** Date | string | undefined → ISO 文字列 | null */
function toIsoString(value: Date | string | undefined | null): string | null {
    if (!value) return null;
    const dt = value instanceof Date ? value : new Date(value);
    return dt.toISOString();
}

/** API レスポンス Todo → 内部表現 Todo (dueAt は Date 型) */
function parseTodo(raw: Todo): Todo {
    return {
        ...raw,
        completed: Boolean(raw.completed),
        reminded: Boolean(raw.reminded),
        dueAt: parseDueAt(raw.dueAt),
    };
}

/** ローカル日時文字列 → JST(+09:00) → UTC ISO-8601 変換 */
function toTokyoISOString(localDatetime: string): string {
    const [d, t] = localDatetime.split("T");
    return new Date(`${d}T${t}:00+09:00`).toISOString();
}

/** ms → 「X日Y時間Z分」フォーマット */
function formatRemaining(ms: number): string {
    if (ms <= 0) return "期限超過";
    const days  = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const mins  = Math.floor((ms % 3_600_000) / 60_000);
    return `${days ? `${days}日` : ""}${hours ? `${hours}時間` : ""}${mins ? `${mins}分` : ""}`;
}

/* ──────── React コンポーネント ──────── */

type Filter = "all" | "today" | "week" | "overdue";

export default function HomePage() {
    const [todos, setTodos]       = useState<Todo[]>([]);
    const [filter, setFilter]     = useState<Filter>("all");
    const [newTitle, setNewTitle] = useState("");
    const [newDueAt, setNewDueAt] = useState<string>("");        // datetime-local 値
    const [error, setError]       = useState<string | null>(null);

    /* 編集モード用 */
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDueAt, setEditDueAt] = useState<string>("");

    /* 初回ロード → 文字列→Date で state セット */
    useEffect(() => {
        (async () => {
            try {
                const raw = await fetchTodos();
                setTodos(raw.map(parseTodo));
            } catch (e) {
                setError((e as Error).message);
            }
        })();
    }, []);

    /* 追加 */
    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        try {
            const created = await createTodo(
                newTitle.trim(),
                newDueAt ? toTokyoISOString(newDueAt) : null
            );
            setTodos(prev => [...prev, parseTodo(created)]);
            setNewTitle("");
            setNewDueAt("");
        } catch (e) {
            setError((e as Error).message);
        }
    };

    /* 完了トグル */
    const handleToggle = async (t: Todo) => {
        try {
            const dueAtIso = toIsoString(t.dueAt);
            const updated  = await updateTodo(
                t.id,
                t.title,
                !t.completed,
                dueAtIso,
                t.reminded ?? false
            );
            setTodos(prev =>
                prev.map(x => (x.id === updated.id ? parseTodo(updated) : x))
            );
        } catch (e) {
            setError((e as Error).message);
        }
    };

    /* 削除 */
    const handleDelete = async (id: string) => {
        try {
            await deleteTodo(id);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            setError((e as Error).message);
        }
    };

    /* 編集モード開始／保存／キャンセル */
    const startEdit = (t: Todo) => {
        setEditingId(t.id);
        setEditTitle(t.title);
        setEditDueAt(t.dueAt ? t.dueAt.toISOString().slice(0, 16) : "");
    };
    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDueAt("");
    };
    const saveEdit = async () => {
        if (!editingId) return;
        const original = todos.find(t => t.id === editingId);
        if (!original) return;
        try {
            const updated = await updateTodo(
                editingId,
                editTitle.trim(),
                original.completed,
                editDueAt ? toTokyoISOString(editDueAt) : null,
                original.reminded
            );
            setTodos(prev =>
                prev.map(x => (x.id === updated.id ? parseTodo(updated) : x))
            );
            cancelEdit();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    /* フィルタリング */
    const now = Date.now();
    const visible = todos.filter(t => {
        if (!t.dueAt) return filter === "all";
        const dueTs = t.dueAt.getTime();
        switch (filter) {
            case "today": {
                const start = new Date(); start.setHours(0,0,0,0);
                return dueTs >= start.getTime() && dueTs < start.getTime() + 86_400_000;
            }
            case "week": {
                const start = new Date(); start.setHours(0,0,0,0);
                const end = start.getTime() + (7 - start.getDay()) * 86_400_000;
                return dueTs >= start.getTime() && dueTs < end;
            }
            case "overdue":
                return dueTs < now;
            default:
                return true;
        }
    });

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">RecruiTrack ToDo</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* フィルタボタン */}
            <div className="flex space-x-2 mb-4">
                {(["all","today","week","overdue"] as Filter[]).map(f => (
                    <button key={f}
                            className={`px-3 py-1 rounded ${filter === f ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            onClick={() => setFilter(f)}
                    >
                        {{all:"全件",today:"今日中",week:"今週中",overdue:"期限切れ"}[f]}
                    </button>
                ))}
            </div>

            {/* 新規追加フォーム */}
            <div className="flex mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Title"
                    className="flex-1 border rounded px-2 py-1"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
                <input
                    type="datetime-local"
                    className="border rounded px-2 py-1"
                    value={newDueAt}
                    onChange={e => setNewDueAt(e.target.value)}
                />
                <button
                    className="bg-green-500 text-white px-4 py-1 rounded"
                    onClick={handleAdd}
                >
                    Add
                </button>
            </div>

            {/* Todo リスト */}
            <ul>
                {visible.map(t => {
                    const dueMs = t.dueAt ? t.dueAt.getTime() - now : 0;
                    const isOver = t.dueAt ? t.dueAt.getTime() < now : false;

                    if (editingId === t.id) {
                        /* 編集モード */
                        return (
                            <li key={t.id} className="mb-2 p-2 border rounded bg-black text-white">
                                <input
                                    type="text"
                                    className="w-full mb-2 px-2 py-1"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                />
                                <input
                                    type="datetime-local"
                                    className="w-full mb-2 px-2 py-1"
                                    value={editDueAt}
                                    onChange={e => setEditDueAt(e.target.value)}
                                />
                                <div className="flex space-x-2">
                                    <button className="bg-white text-black px-3 py-1 rounded" onClick={saveEdit}>Save</button>
                                    <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </li>
                        );
                    }

                    /* 通常表示モード */
                    return (
                        <li key={t.id}
                            className={`flex items-center justify-between mb-2 p-2 border rounded ${isOver ? "border-red-500" : "border-gray-200"}`}>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" checked={Boolean(t.completed)} onChange={() => handleToggle(t)} />
                                <span className={t.completed ? "line-through text-gray-500" : ""}>{t.title}</span>
                            </div>
                            <div className="text-right text-sm space-y-1">
                                {t.dueAt ? (
                                    <>
                                        <div>期限: {t.dueAt.toLocaleString()}</div>
                                        <div>残り: {formatRemaining(dueMs)}</div>
                                        <div>
                                            通知:{" "}
                                            {t.reminded ? <span className="text-green-600">済み</span>
                                                : <span className="text-red-600">未</span>}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-500">期限なし</div>
                                )}
                                <div className="flex space-x-2 mt-1 justify-end">
                                    <button className="text-blue-500" onClick={() => startEdit(t)}>Edit</button>
                                    <button className="text-red-500" onClick={() => handleDelete(t.id)}>✕</button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
