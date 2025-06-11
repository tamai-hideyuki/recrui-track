import { z } from "zod";

/** 出力用スキーマ */
export const CompanyOutputSchema = z.object({
    id:          z.string().uuid(),
    name:        z.string(),
    industry:    z.string(),
    appliedDate: z.number().int(),
    status:      z.enum(["未応募","応募済","選考中","内定","辞退"]),
    memo:        z.string().optional(),
    createdAt:   z.number().int(),
    updatedAt:   z.number().int(),
});

/** こっちをインターフェースとしてエクスポート */
export interface CompanyOutput {
    id: string;
    name: string;
    industry: string;
    appliedDate: number;
    status: string;
    memo?: string;
    createdAt: number;
    updatedAt: number;
}

/** 内部処理用に型推論も残すなら */
export type CompanyOutputType = z.infer<typeof CompanyOutputSchema>;
