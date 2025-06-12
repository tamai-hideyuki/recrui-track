// src/application/dto/CompanyOutput.ts
import { z } from "zod";

/** ステータス候補（共通定義を再 import しても OK） */
const companyStatuses = [
    "未応募",
    "カジュアル面談",
    "書類選考中",
    "応募済",
    "選考中",
    "一次選考",
    "二次選考",
    "三次選考",
    "最終面接",
    "内定",
    "オファー面談",
    "辞退",
    "不採用",
] as const;

/** 値も export する（← barrel で使われる） */
export const CompanyOutputSchema = z.object({
    id:          z.string().uuid(),
    name:        z.string(),
    industry:    z.string(),
    url:         z.string().url(),
    appliedDate: z.number().int(),
    status:      z.enum(companyStatuses),
    memo:        z.string().optional(),
    createdAt:   z.number().int(),
    updatedAt:   z.number().int(),
});

/** 型専用 export（type-only） */
export type CompanyOutput = z.infer<typeof CompanyOutputSchema>;
