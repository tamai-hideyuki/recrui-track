"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    fetchCompany,
    updateCompany,
    type CompanyFormInput,
    CompanyFormSchema,
} from "@/lib/companyApi";

export default function CompanyEditPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };

    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CompanyFormInput>({
        resolver: zodResolver(CompanyFormSchema),
    });

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const company = await fetchCompany(id);
                reset({
                    name: company.name,
                    industry: company.industry,
                    appliedDate: new Date(company.appliedDate)
                        .toISOString()
                        .slice(0, 10),
                    status: company.status as CompanyFormInput["status"],
                    memo: company.memo ?? "",
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                setFetchError(message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id, reset]);

    const onSubmit = async (data: CompanyFormInput) => {
        if (!id) return;
        try {
            await updateCompany(id, data);
            router.push("/companies");
        } catch (err: unknown) {
            console.error(err);
            alert("更新に失敗しました。");
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-gray-500">読み込み中…</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-red-600">データ取得エラー: {fetchError}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-lg p-6 bg-white shadow rounded">
            <h1 className="text-2xl font-semibold mb-6 text-black">企業情報編集</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* 企業名 */}
                <div>
                    <label className="block mb-1 font-medium text-black">企業名</label>
                    <input
                        {...register("name")}
                        className={`w-full text-black border rounded px-3 py-2 ${
                            errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* 業種・職種 */}
                <div>
                    <label className="block mb-1 font-medium text-black">URL</label>
                    <input
                        {...register("industry")}
                        className={`w-full text-black border rounded px-3 py-2 ${
                            errors.industry ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.industry && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.industry.message}
                        </p>
                    )}
                </div>

                {/* 応募日 */}
                <div>
                    <label className="block mb-1 font-medium text-black">応募日</label>
                    <input
                        type="date"
                        {...register("appliedDate")}
                        className={`w-full text-black border rounded px-3 py-2 ${
                            errors.appliedDate ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.appliedDate && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.appliedDate.message}
                        </p>
                    )}
                </div>

                {/* ステータス */}
                <div>
                    <label className="block mb-1 font-medium text-black">ステータス</label>
                    <select
                        {...register("status")}
                        className="w-full text-black border-gray-300 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="未応募">未応募</option>
                        <option value="カジュアル面談">カジュアル面談</option>
                        <option value="書類選考中">書類選考中</option>
                        <option value="一次選考中">一次選考中</option>
                        <option value="二次選考中">二次選考中</option>
                        <option value="三次選考中">三次選考中</option>
                        <option value="最終面接">最終面接</option>
                        <option value="内定">内定</option>
                        <option value="辞退">辞退</option>
                        <option value="不採用">不採用</option>
                    </select>
                </div>

                {/* メモ */}
                <div>
                    <label className="block mb-1 font-medium text-black">メモ</label>
                    <textarea
                        {...register("memo")}
                        rows={4}
                        className="w-full text-black border-gray-300 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* ボタン */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.push("/companies")}
                        className="text-gray-600 hover:underline"
                        disabled={isSubmitting}
                    >
                        戻る
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSubmitting ? "更新中…" : "更新する"}
                    </button>
                </div>
            </form>
        </div>
    );
}
