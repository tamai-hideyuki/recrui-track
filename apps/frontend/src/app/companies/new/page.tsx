"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createCompany,
    companyStatuses,
    type CompanyFormInput,
    CompanyFormSchema,
} from "@/lib/companyApi";

export default function CompanyNewPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
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

    const onSubmit = async (data: CompanyFormInput) => {
        try {
            await createCompany(data);
            router.push("/companies");
        } catch (err) {
            console.error(err);
            alert(`登録に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const inputClass =
        "w-full text-black border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

    return (
        <div className="container mx-auto max-w-lg p-6 bg-white shadow rounded">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">企業登録</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* 企業名 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">企業名</label>
                    <input
                        {...register("name")}
                        className={`${inputClass} ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
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
                        placeholder="https://example.com"
                        className={`${inputClass} ${errors.url ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.url && <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>}
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
                        className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "登録中…" : "登録する"}
                    </button>
                </div>
            </form>
        </div>
    );
}
