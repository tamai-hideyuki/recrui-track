import { z } from "zod";

/** 入力用 Zod スキーマ */
export const CreateCompanyInputSchema = z.object({
    name:        z.string().min(1),
    industry:    z.string().min(1),
    url:         z.string().url(),
    appliedDate: z.number().int(),
    status:      z.enum([
        "未応募",
        "応募済",
        "選考中",
        "一次選考",
        "二次選考",
        "三次選考",
        "最終面接",
        "内定",
        "辞退",
        "不採用",
    ]),
    memo:        z.string().optional(),
});

/** 更新時はID込みで同じフィールドを再利用 */
export const UpdateCompanyInputSchema = CreateCompanyInputSchema.extend({
    id: z.string().uuid(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanyInputSchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyInputSchema>;
