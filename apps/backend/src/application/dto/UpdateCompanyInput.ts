import { z } from "zod";

/** 入力用 Zod スキーマ */
export const UpdateCompanyInputSchema = z.object({
    id:          z.string().uuid(),
    name:        z.string().min(1),
    industry:    z.string().min(1),
    appliedDate: z.number().int(),
    status:      z.enum(["未応募","応募済","選考中","内定","辞退"]),
    memo:        z.string().optional(),
});

/** スキーマから型推論 */
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyInputSchema>;
