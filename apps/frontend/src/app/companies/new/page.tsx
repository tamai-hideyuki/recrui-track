"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createCompany,
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
            appliedDate: new Date().toISOString().slice(0, 10), // yyyy-MM-dd
            status: "未応募",
            memo: "",
        },
    });

    const onSubmit = async (data: CompanyFormInput) => {
        try {
            await createCompany(data);
            router.push("/companies");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            alert(`登録に失敗しました: ${message}`);
        }
    };

    return (
        <div className="container mx-auto max-w-lg p-6 bg-white shadow rounded">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">企業登録</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* 企業名 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">企業名</label>
                    <input
                        {...register("name")}
                        className={`w-full text-black border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* 業種 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">URL</label>
                    <input
                        {...register("industry")}
                        className={`w-full text-black border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            errors.industry ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.industry && (
                        <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
                    )}
                </div>

                {/* 応募日 */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">応募日</label>
                    <input
                        type="date"
                        {...register("appliedDate")}
                        className={`w-full text-black border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
                    <label className="block mb-1 font-medium text-gray-700">ステータス</label>
                    <select
                        {...register("status")}
                        className="w-full text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="未応募">未応募</option>
                        <option value="応募済">応募済</option>
                        <option value="一次選考中">一次選考中</option>
                        <option value="二次選考中">二次選考中</option>
                        <option value="三次選考中">三次選考中</option>
                        <option value="最終面接">最終面接</option>
                        <option value="内定">内定</option>
                        <option value="ウェルカム面談">ウェルカム面談</option>
                        <option value="辞退">辞退</option>
                        <option value="不採用">不採用</option>
                    </select>
                </div>

                {/* メモ */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">メモ</label>
                    <textarea
                        {...register("memo")}
                        rows={4}
                        className="w-full text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
