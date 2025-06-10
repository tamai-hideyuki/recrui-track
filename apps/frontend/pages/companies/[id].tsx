import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   fetchCompany,
       updateCompany,
       type CompanyFormInput,
       CompanyFormSchema,
     } from '@/lib/companyApi';

export default function CompanyEditPage() {
    const router = useRouter();
    const { id } = router.query;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CompanyFormInput>({
        resolver: zodResolver(CompanyFormSchema),
    });

    // 既存データをロードしてフォームを初期化
    useEffect(() => {
        if (typeof id !== "string") return;
        fetchCompany(id).then((company) => {
            reset({
                name:        company.name,
                industry:    company.industry,
                appliedDate: new Date(company.appliedDate).toISOString().slice(0, 10),
                status:      company.status as CompanyFormInput["status"],
                memo:        company.memo ?? "",
            });
        });
    }, [id, reset]);

    const onSubmit = async (data: CompanyFormInput) => {
        if (typeof id !== "string") return;
        await updateCompany(id, data);
        router.push("/companies");
    };

    return (
        <div className="container">
            <h1>企業情報編集</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* name, industry, appliedDate, status, memo は new.tsx と同じ */}
                <div>
                    <label>企業名</label>
                    <input {...register("name")} />
                    {errors.name && <p className="error">{errors.name.message}</p>}
                </div>
                {/* ... 以下同様にフィールドを配置 ... */}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "更新中…" : "更新する"}
                </button>
            </form>
        </div>
    );
}
