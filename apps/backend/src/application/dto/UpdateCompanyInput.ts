import { z } from "zod";

/** 企業ステータスの候補を定義 */
const companyStatuses = [
    "未応募",
    "カジュアル面談",
    "書類選考中",
    "一次選考",
    "二次選考",
    "三次選考",
    "最終面接",
    "応募済",
    "選考中",
    "内定",
    "オファー面談",
    "辞退",
    "不採用",
] as const;

/** 新規登録用 Zod スキーマ */
export const CreateCompanyInputSchema = z.object({
    name:        z.string().min(1),
    industry:    z.string().min(1),
    url:         z.string().url(),
    appliedDate: z.number().int(),
    status:      z.enum(companyStatuses),
    memo:        z.string().optional(),
});

/** 更新用 Zod スキーマ（ID を追加拡張） */
export const UpdateCompanyInputSchema = CreateCompanyInputSchema.extend({
    id: z.string().uuid(),
});

/** スキーマから型推論 */
export type CreateCompanyInput = z.infer<typeof CreateCompanyInputSchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyInputSchema>;
