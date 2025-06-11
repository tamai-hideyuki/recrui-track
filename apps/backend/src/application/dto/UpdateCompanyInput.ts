import { z } from "zod";

/** 入力用 Zod スキーマ */
/** 企業ステータスの候補を定義 */
const companyStatuses = [
    "未応募",
    "カジュアル面談",
    "書類選考中",
    "一次選考中",
    "二次選考中",
    "三次選考中",
    "最終面接",
    "応募済",
    "選考中",
    "内定",
    "辞退",
    "不採用",
] as const;

/** 入力用 Zod スキーマ */
export const UpdateCompanyInputSchema = z.object({
    id:          z.string().uuid(),
    name:        z.string().min(1),
    industry:    z.string().min(1),
    appliedDate: z.number().int(),
    status:      z.enum(companyStatuses),
    memo:        z.string().optional(),
});

/** スキーマから型推論 */
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyInputSchema>;

