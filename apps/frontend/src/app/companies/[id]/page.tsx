"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    fetchCompany,
    updateCompany,
    companyStatuses,
    type CompanyFormInput,
    CompanyFormSchema,
} from "@/lib/companyApi";

export default function CompanyEditPage() {
    const router = useRouter();
    const { id } = useParams() as { id?: string };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CompanyFormInput>({
        resolver: zodResolver(CompanyFormSchema),
        defaultValues: {
            name: "",
            industry: "",
            url: "",
            appliedDate: new Date().toISOString().slice(0, 10),
            status: companyStatuses[0],
            memo: "",
        },
    });

    useEffect(() => {
        if (!id) return;
        fetchCompany(id)
            .then((company) => {
                reset({
                    name: company.name,
                    industry: company.industry,
                    url: company.url,
                    appliedDate: new Date(company.appliedDate).toISOString().slice(0, 10),
                    status: company.status as CompanyFormInput["status"],
                    memo: company.memo ?? "",
                });
            })
            .catch((err) => {
                console.error(err);
                alert("企業情報の取得に失敗しました");
                router.push("/companies");
            });
    }, [id, reset, router]);

    const onSubmit = async (data: CompanyFormInput) => {
        if (!id) return;
        try {
            await updateCompany(id, data);
            router.push("/companies");
        } catch (err) {
            console.error(err);
            alert("更新に失敗しました");
        }
    };

    const inputClass =
        "w-full text-black border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

    return (
        <div className="container mx-auto max-w-lg p-6 bg-white shadow rounded">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                企業情報編集
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* 企業名 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">企業名</label>
                    <input
                        {...register("name")}
                        className={`${inputClass} ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* 業種 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">業種</label>
                    <input
                        {...register("industry")}
                        className={`${inputClass} ${errors.industry ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.industry && (
                        <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
                    )}
                </div>

                {/* URL */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">URL</label>
                    <input
                        {...register("url")}
                        className={`${inputClass} ${errors.url ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.url && (
                        <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
                    )}
                </div>

                {/* 応募日 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">応募日</label>
                    <input
                        type="date"
                        {...register("appliedDate")}
                        className={`${inputClass} ${errors.appliedDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.appliedDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.appliedDate.message}</p>
                    )}
                </div>

                {/* ステータス */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">ステータス</label>
                    <select
                        {...register("status")}
                        className={`${inputClass.replace("focus:ring-blue-400", "")} border-gray-300`}
                    >
                        {companyStatuses.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                {/* メモ */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">メモ</label>
                    <textarea
                        {...register("memo")}
                        rows={4}
                        className={`${inputClass.replace("focus:ring-blue-400", "")} border-gray-300`}
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
                        className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "更新中…" : "更新する"}
                    </button>
                </div>
            </form>
        </div>
    );
}
