"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany } from "@/lib/companyApi";
import type { Company } from "@/types/company";

export default function CompanyList() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ソート状態
    const [sortKey, setSortKey] = useState<keyof Company | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    // ステータスの並びを定義
    const statusOrder = [
        "応募中",
        "書類選考中",
        "面談中",
        "内定",
        "辞退",
        "不採用",
    ];

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

    // ソート済みデータを算出
    const sorted = useMemo(() => {
        if (!sortKey) return companies;

        return [...companies].sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";

            // 日付
            if (sortKey === "appliedDate") {
                const da = new Date(va as string).getTime();
                const db = new Date(vb as string).getTime();
                return sortAsc ? da - db : db - da;
            }

            // ステータス
            if (sortKey === "status") {
                const ia = statusOrder.indexOf(va as string);
                const ib = statusOrder.indexOf(vb as string);
                return sortAsc ? ia - ib : ib - ia;
            }

            // 文字列全般
            return sortAsc
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });
    }, [companies, sortKey, sortAsc]);

    if (isLoading)
        return (
            <div className="container mx-auto p-4">
                <p className="text-gray-500">読み込み中…</p>
            </div>
        );
    if (error)
        return (
            <div className="container mx-auto p-4">
                <p className="text-red-600">エラーが発生しました: {error}</p>
            </div>
        );

    // ヘッダー定義
    const headers: { label: string; key: keyof Company }[] = [
        { label: "企業名", key: "name" },
        { label: "URL", key: "industry" },
        { label: "応募日", key: "appliedDate" },
        { label: "ステータス", key: "status" },
    ];

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">企業リスト</h1>
                <Link
                    href="/companies/new"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    新規登録
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white shadow rounded text-black">
                    <thead className="bg-gray-100 text-black">
                    <tr>
                        {headers.map(({ label, key }) => {
                            const active = sortKey === key;
                            return (
                                <th
                                    key={key}
                                    className="px-4 py-2 text-left cursor-pointer select-none"
                                    onClick={() => {
                                        if (sortKey === key) {
                                            setSortAsc((f) => !f);
                                        } else {
                                            setSortKey(key);
                                            setSortAsc(true);
                                        }
                                    }}
                                >
                                    {label} {active && (sortAsc ? "▲" : "▼")}
                                </th>
                            );
                        })}
                        <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                            <td className="border-t px-4 py-2">{c.name}</td>
                            <td className="border-t px-4 py-2">{c.industry}</td>
                            <td className="border-t px-4 py-2">
                                {new Date(c.appliedDate).toLocaleDateString()}
                            </td>
                            <td className="border-t px-4 py-2">{c.status}</td>
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
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {sorted.length === 0 && (
                    <p className="text-gray-500 mt-4">登録された企業がありません。</p>
                )}
            </div>
        </div>
    );
}
