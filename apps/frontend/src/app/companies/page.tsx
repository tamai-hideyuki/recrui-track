"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany } from "@/lib/companyApi";
import type { Company } from "@/types/company";

export default function CompanyList() {
    // データ・ローディング・エラー・削除中ID 管理
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ソート状態管理
    const [sortKey, setSortKey] = useState<keyof Company>("name");
    const [sortAsc, setSortAsc] = useState(true);

    // ステータスの独自ソート順
    const statusOrder = [
        "未応募",
        "カジュアル面談",
        "書類選考中",
        "一次選考",
        "二次選考",
        "三次選考",
        "最終面接",
        "内定",
        "オファー面談",
        "辞退",
        "不採用",
    ] as const;

    // ——— ピン留め状態管理 ———
    // localStorage から復元
    const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("pinnedCompanies") || "[]");
        } catch {
            return [];
        }
    });

    // pinnedIds 更新時に保存
    useEffect(() => {
        localStorage.setItem("pinnedCompanies", JSON.stringify(pinnedIds));
    }, [pinnedIds]);

    // 初回データ取得
    useEffect(() => {
        (async () => {
            try {
                const data = await fetchCompanies();
                setCompanies(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // 削除処理
    const onDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return;
        setDeletingId(id);
        try {
            await deleteCompany(id);
            setCompanies((prev) => prev.filter((c) => c.id !== id));
        } catch (err: unknown) {
            alert(`削除に失敗しました: ${err instanceof Error ? err.message : err}`);
        } finally {
            setDeletingId(null);
        }
    };

    // ピントグル関数
    const togglePin = (id: string) => {
        setPinnedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ソート済み＋ピン先頭
    const sorted = useMemo(() => {
        // ① 既存のキー／昇降ソート
        const base = [...companies].sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";

            // 日付ソート
            if (sortKey === "appliedDate") {
                const da = new Date(va as string).getTime();
                const db = new Date(vb as string).getTime();
                return sortAsc ? da - db : db - da;
            }

            // ステータス独自順
            if (sortKey === "status") {
                const ia = statusOrder.indexOf(va as typeof statusOrder[number]);
                const ib = statusOrder.indexOf(vb as typeof statusOrder[number]);
                return sortAsc ? ia - ib : ib - ia;
            }

            // 文字列比較
            return sortAsc
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });

        // ② ピン済みを先頭に
        const pinned = base.filter((c) => pinnedIds.includes(c.id));
        const unpinned = base.filter((c) => !pinnedIds.includes(c.id));
        return [...pinned, ...unpinned];
    }, [companies, sortKey, sortAsc, pinnedIds]);

    // ローディング/エラー表示
    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-gray-500">読み込み中…</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-red-600">エラーが発生しました: {error}</p>
            </div>
        );
    }

    // テーブルヘッダー定義
    const headers: {
        label: string;
        key: keyof Company;
        isLink?: boolean;
    }[] = [
        { label: "企業名", key: "name" },
        { label: "URL", key: "url", isLink: true },
        { label: "応募日", key: "appliedDate" },
        { label: "ステータス", key: "status" },
    ];

    // ソートキー切り替え
    const onSort = (key: keyof Company) => {
        if (sortKey === key) {
            setSortAsc((prev) => !prev);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* タイトル＆新規登録 */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">企業リスト</h1>
                <Link
                    href="/companies/new"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    新規登録
                </Link>
            </div>

            {/* テーブル */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white shadow rounded text-black">
                    <thead className="bg-gray-100">
                    <tr>
                        {headers.map(({ label, key }) => (
                            <th
                                key={key}
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => onSort(key)}
                            >
                                {label}
                                {sortKey === key && (
                                    <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>
                                )}
                            </th>
                        ))}
                        <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.length > 0 ? (
                        sorted.map((c) => (
                            <tr
                                key={c.id}
                                className={`hover:bg-gray-50 ${
                                    pinnedIds.includes(c.id) ? "bg-yellow-50" : ""
                                }`}
                            >
                                {headers.map(({ key, isLink }) => {
                                    const val = c[key];
                                    // URL列はリンク
                                    if (isLink && typeof val === "string") {
                                        return (
                                            <td key={key} className="border-t px-4 py-2">
                                                <a
                                                    href={val}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {val}
                                                </a>
                                            </td>
                                        );
                                    }
                                    // 日付列
                                    if (key === "appliedDate") {
                                        return (
                                            <td key={key} className="border-t px-4 py-2">
                                                {new Date(val as number).toLocaleDateString()}
                                            </td>
                                        );
                                    }
                                    // その他
                                    return (
                                        <td key={key} className="border-t px-4 py-2">
                                            {String(val)}
                                        </td>
                                    );
                                })}
                                <td className="border-t px-4 py-2 space-x-3">
                                    <Link
                                        href={`/companies/${c.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        編集
                                    </Link>
                                    <button
                                        onClick={() => onDelete(c.id)}
                                        disabled={deletingId === c.id}
                                        className="text-red-600 hover:underline disabled:opacity-50"
                                    >
                                        {deletingId === c.id ? "削除中…" : "削除"}
                                    </button>
                                    <button
                                        onClick={() => togglePin(c.id)}
                                        className="ml-2"
                                    >
                                        {pinnedIds.includes(c.id) ? "✅" : "☑️"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length + 1}
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                登録された企業がありません。
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
