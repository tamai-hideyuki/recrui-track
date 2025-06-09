import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { companies } from "../schema";
import { Company as CompanyEntity, CompanyStatus } from "../../domain/entity/Company";

// ドメイン変換ヘルパー
function toDomain(row: {
    id: string;
    name: string;
    industry: string;
    applied_date: number;
    status: string;
    memo: string | null;
    created_at: number;
    updated_at: number;
}): CompanyEntity {
    return new CompanyEntity(
        row.id,
        row.name,
        row.industry,
        new Date(row.applied_date),
        row.status as CompanyStatus,
        row.memo || undefined
    );
}

export class DrizzleCompanyRepository {
    /** 全件取得 */
    async findAll(): Promise<CompanyEntity[]> {
        const rows = await db
            .select({
                id:        companies.id,
                name:      companies.name,
                industry:  companies.industry,
                applied_date: companies.appliedDate,
                status:    companies.status,
                memo:      companies.memo,
                created_at: companies.createdAt,
                updated_at: companies.updatedAt,
            })
            .from(companies);
        return rows.map(toDomain);
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<CompanyEntity | null> {
        const row = await db
            .select({
                id:        companies.id,
                name:      companies.name,
                industry:  companies.industry,
                applied_date: companies.appliedDate,
                status:    companies.status,
                memo:      companies.memo,
                created_at: companies.createdAt,
                updated_at: companies.updatedAt,
            })
            .from(companies)
            .where(eq(companies.id, id))
            .limit(1)
            .then(rs => rs[0] || null);

        return row ? toDomain(row) : null;
    }

    /** 新規作成・更新 */
    async save(entity: CompanyEntity): Promise<void> {
        await db
            .insert(companies)
            .values({
                id:           entity.id,
                name:         entity.name,
                industry:     entity.industry,
                applied_date: entity.appliedDate.getTime(),
                status:       entity.status,
                memo:         entity.memo,
            })
            .onConflictDoUpdate({
                target: companies.id,
                set: {
                    name:         entity.name,
                    industry:     entity.industry,
                    applied_date: entity.appliedDate.getTime(),
                    status:       entity.status,
                    memo:         entity.memo,
                    updated_at:   Date.now(),
                },
            });
    }

    /** ID で削除 */
    async deleteById(id: string): Promise<void> {
        await db
            .delete(companies)
            .where(eq(companies.id, id));
    }
}
