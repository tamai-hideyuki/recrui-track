"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany } from "@/lib/companyApi";
import type { Company } from "@/types/company";

export default function CompanyList() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchCompanies();
                setCompanies(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
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
            const message = err instanceof Error ? err.message : String(err);
            alert(`削除に失敗しました: ${message}`);
        } finally {
            setDeletingId(null);
        }
    };

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
                <table className="min-w-full table-auto bg-white shadow rounded">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">企業名</th>
                        <th className="px-4 py-2 text-left">業種</th>
                        <th className="px-4 py-2 text-left">応募日</th>
                        <th className="px-4 py-2 text-left">ステータス</th>
                        <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {companies.map((c) => (
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
                {companies.length === 0 && (
                    <p className="text-gray-500 mt-4">登録された企業がありません。</p>
                )}
            </div>
        </div>
    );
}
