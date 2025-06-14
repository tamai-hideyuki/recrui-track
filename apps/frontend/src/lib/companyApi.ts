import { z } from "zod";
import { Company } from "@/types/company";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

/** ステータスを一元定義して再利用 */
export const companyStatuses = [
    "未応募",
    "カジュアル面談",
    "書類選考中",
    "応募済",
    "選考中",
    "一次選考",
    "二次選考",
    "三次選考",
    "コーディングテスト",
    "最終面接",
    "内定",
    "オファー面談",
    "辞退",
    "不採用",
] as const;
export type CompanyStatus = typeof companyStatuses[number];

/** フォーム入力 Zod スキーマ & 型 */
export const CompanyFormSchema = z.object({
    name: z.string().min(1, "企業名は必須です"),
    industry: z.string().min(1, "業界は必須です"),
    url: z.string().url("有効な URL を入力してください"),
    appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付が不正です"),
    status: z.enum(companyStatuses, {
        errorMap: () => ({ message: "ステータスが不正です" }),
    }),
    memo: z.string().optional(),
});
export type CompanyFormInput = z.infer<typeof CompanyFormSchema>;

/** Payload変換ヘルパー */
const toPayload = ({ appliedDate, ...rest }: CompanyFormInput) => ({
    ...rest,
    appliedDate: new Date(appliedDate).getTime(),
});

/** 共通ヘッダー */
const JSON_HEADERS = { "Content-Type": "application/json" };

/** 共通リクエスト */
async function request<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: JSON_HEADERS,
        ...options,
    });
    if (!res.ok) throw new Error(`${options?.method || "GET"} ${path} failed`);

    // DELETE は204返却を想定
    if (options?.method === "DELETE") {
        return undefined as unknown as T;
    }
    return res.json();
}

/** 全件取得 */
export const fetchCompanies = (): Promise<Company[]> =>
    request<Company[]>("/api/companies");

/** １件取得 */
export const fetchCompany = (id: string): Promise<Company> =>
    request<Company>(`/api/companies/${id}`);

/** 企業登録 */
export const createCompany = (
    data: CompanyFormInput
): Promise<Company> =>
    request<Company>("/api/companies", {
        method: "POST",
        body: JSON.stringify(toPayload(data)),
    });

/** 企業更新 */
export const updateCompany = (
    id: string,
    data: CompanyFormInput
): Promise<Company> =>
    request<Company>(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(toPayload(data)),
    });

/** 企業削除 */
export const deleteCompany = (id: string): Promise<void> =>
    request<void>(`/api/companies/${id}`, { method: "DELETE" });
