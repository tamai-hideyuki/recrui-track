import { z } from "zod";
import { Company } from "@/types/company";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";


//  フォーム用 Zod スキーマを追加
export const CompanyFormSchema = z.object({
    name: z.string().min(1, "企業名は必須です"),
    industry: z.string().min(1, "業界は必須です"),
    appliedDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で指定してください"),
    status: z.string().min(1, "ステータスは必須です"),
    memo: z.string().optional(),
});

// スキーマから型を生成
export type CompanyFormInput = z.infer<typeof CompanyFormSchema>;

/** 全企業取得 */
export async function fetchCompanies(): Promise<Company[]> {
    const res = await fetch(`${BASE}/api/companies`);
    if (!res.ok) throw new Error("fetchCompanies failed");
    return res.json();
}

/** 単一企業取得 */
export async function fetchCompany(id: string): Promise<Company> {
    const res = await fetch(`${BASE}/api/companies/${id}`);
    if (!res.ok) throw new Error("fetchCompany failed");
    return res.json();
}

/**
 * 企業登録
 * @param input.appliedDate: "YYYY-MM-DD" などの文字列
 */
export async function createCompany(
    input: CompanyFormInput
): Promise<Company> {
    // appliedDate をミリ秒に変換
    const payload = {
        ...input,
        appliedDate: new Date(input.appliedDate).getTime(),
    };

    const res = await fetch(`${BASE}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("createCompany failed");
    return res.json();
}

/**
 * 企業更新
 * @param input.appliedDate: "YYYY-MM-DD" などの文字列
 */
export async function updateCompany(
    id: string,
    input: CompanyFormInput
): Promise<Company> {
    const payload = {
        ...input,
        appliedDate: new Date(input.appliedDate).getTime(),
    };

    const res = await fetch(`${BASE}/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("updateCompany failed");
    return res.json();
}

/** 企業削除 */
export async function deleteCompany(id: string): Promise<void> {
    const res = await fetch(`${BASE}/api/companies/${id}`, {
        method: "DELETE",
    });
    if (res.status !== 204) throw new Error("deleteCompany failed");
}
