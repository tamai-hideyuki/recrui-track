import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
 import {
       createCompany,
       type CompanyFormInput,
       CompanyFormSchema,
     } from '@/lib/companyApi';


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
        await createCompany(data);
        router.push("/companies");
    };

    return (
        <div className="container">
            <h1>企業登録</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>企業名</label>
                    <input {...register("name")} />
                    {errors.name && <p className="error">{errors.name.message}</p>}
                </div>

                <div>
                    <label>業種</label>
                    <input {...register("industry")} />
                    {errors.industry && <p className="error">{errors.industry.message}</p>}
                </div>

                <div>
                    <label>応募日</label>
                    <input type="date" {...register("appliedDate")} />
                    {errors.appliedDate && <p className="error">{errors.appliedDate.message}</p>}
                </div>

                <div>
                    <label>ステータス</label>
                    <select {...register("status")}>
                        <option value="未応募">未応募</option>
                        <option value="応募済">応募済</option>
                        <option value="選考中">選考中</option>
                        <option value="内定">内定</option>
                        <option value="辞退">辞退</option>
                    </select>
                </div>

                <div>
                    <label>メモ</label>
                    <textarea {...register("memo")} />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "登録中…" : "登録する"}
                </button>
            </form>
        </div>
    );
}
