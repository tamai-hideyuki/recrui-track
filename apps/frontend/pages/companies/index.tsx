import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany } from "@/lib/companyApi";
import { Company } from "@/types/company";

export default function CompanyList() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

     useEffect(() => {
           fetchCompanies()
             .then(setCompanies)
             .catch((err: unknown) => {
                   const message = err instanceof Error ? err.message : String(err);
                   setError(message);
                 })
             .finally(() => setIsLoading(false));
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
        return <p>読み込み中…</p>;
    }
    if (error) {
        return <p className="error">エラーが発生しました: {error}</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">企業リスト</h1>
            <div className="mb-4">
                <Link href="/companies/new" className="btn">
                    新規登録
                </Link>
            </div>
            <table className="min-w-full table-auto border-collapse">
                <thead>
                <tr>
                    <th className="border px-2 py-1">企業名</th>
                    <th className="border px-2 py-1">業種</th>
                    <th className="border px-2 py-1">応募日</th>
                    <th className="border px-2 py-1">ステータス</th>
                    <th className="border px-2 py-1">操作</th>
                </tr>
                </thead>
                <tbody>
                {companies.map((c) => (
                    <tr key={c.id}>
                        <td className="border px-2 py-1">{c.name}</td>
                        <td className="border px-2 py-1">{c.industry}</td>
                        <td className="border px-2 py-1">
                            {new Date(c.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="border px-2 py-1">{c.status}</td>
                        <td className="border px-2 py-1 space-x-2">
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
        </div>
    );
}
