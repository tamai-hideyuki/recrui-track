import { eq, type InferModel } from "drizzle-orm";
import { db } from "../db/db";
import { companies } from "../db/schema";
import { Company as CompanyEntity, CompanyStatus } from "../../domain/entity/Company";

// Drizzle のテーブル定義から SELECT 用の行型を自動取得
type CompanyRow = InferModel<typeof companies, "select">;

/** DB レコード → ドメインエンティティ変換 */
function toDomain(row: CompanyRow): CompanyEntity {
    return CompanyEntity.reconstruct(
        row.id,
        row.name,
        row.industry,
        row.appliedDate,
        row.status as CompanyStatus,
        row.memo ?? undefined,
        row.createdAt,
        row.updatedAt
    );
}

export class DrizzleCompanyRepository {
    /** 全件取得（作成日時昇順ソート） */
    async findAll(): Promise<CompanyEntity[]> {
        const rows = await db
            .select({
                id:           companies.id,
                name:         companies.name,
                industry:     companies.industry,
                appliedDate:  companies.appliedDate,
                status:       companies.status,
                memo:         companies.memo,
                createdAt:    companies.createdAt,
                updatedAt:    companies.updatedAt,
            })
            .from(companies)
            .orderBy(companies.createdAt);

        return rows.map(toDomain);
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<CompanyEntity | null> {
        const row = await db
            .select({
                id:           companies.id,
                name:         companies.name,
                industry:     companies.industry,
                appliedDate:  companies.appliedDate,
                status:       companies.status,
                memo:         companies.memo,
                createdAt:    companies.createdAt,
                updatedAt:    companies.updatedAt,
            })
            .from(companies)
            .where(eq(companies.id, id))
            .limit(1)
            .then(rs => rs[0] ?? null);

        return row ? toDomain(row) : null;
    }

    /** 新規作成または更新 */
    async save(entity: CompanyEntity): Promise<void> {
        await db
            .insert(companies)
            .values({
                id:           entity.id,
                name:         entity.name,
                industry:     entity.industry,
                appliedDate:  entity.appliedDate,
                status:       entity.status,
                memo:         entity.memo,
                createdAt:    entity.createdAt,
                updatedAt:    entity.updatedAt,
            })
            .onConflictDoUpdate({
                target: companies.id,
                set: {
                    name:         entity.name,
                    industry:     entity.industry,
                    appliedDate:  entity.appliedDate,
                    status:       entity.status,
                    memo:         entity.memo,
                    updatedAt:    new Date(),
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
