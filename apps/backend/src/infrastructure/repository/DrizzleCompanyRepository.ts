import { eq, type InferModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db";
import { companies } from "../db/schema";
import { Company as CompanyEntity, CompanyStatus } from "../../domain/entity/Company";

// Drizzle のテーブル定義から SELECT 用の行型を自動取得
export type CompanyRow = InferModel<typeof companies, "select">;

/** DB レコード → ドメインエンティティ変換 */
const toDomain = (row: CompanyRow): CompanyEntity =>
    CompanyEntity.reconstruct(
        row.id,
        row.name,
        row.industry,
        row.url,
        row.appliedDate,
        row.status as CompanyStatus,
        row.memo ?? undefined,
        row.createdAt,
        row.updatedAt
    );

export class DrizzleCompanyRepository {
    /** 全件取得（作成日時昇順） */
    async findAll(): Promise<CompanyEntity[]> {
        const rows: CompanyRow[] = await db
            .select()
            .from(companies)
            .orderBy(companies.createdAt);
        return rows.map(toDomain);
    }

    /** ID で単一取得 */
    async findById(id: string): Promise<CompanyEntity | null> {
        const rows: CompanyRow[] = await db
            .select()
            .from(companies)
            .where(eq(companies.id, id));
        return rows.length > 0 ? toDomain(rows[0]) : null;
    }

    /** 新規作成または更新 */
    async save(entity: CompanyEntity): Promise<void> {
        const isNew = !entity.id;
        const id = isNew ? uuidv4() : entity.id;
        const now = new Date();
        const createdAt = isNew ? now : entity.createdAt;

        // 共通フィールド
        const baseValues = {
            name:        entity.name,
            industry:    entity.industry,
            url:         entity.url,
            appliedDate: entity.appliedDate,
            status:      entity.status,
            memo:        entity.memo,
        };

        await db
            .insert(companies)
            .values({ id, ...baseValues, createdAt, updatedAt: now })
            .onConflictDoUpdate({
                target: companies.id,
                set: { ...baseValues, updatedAt: now },
            });
    }

    /** ID で削除 */
    async deleteById(id: string): Promise<void> {
        await db.delete(companies).where(eq(companies.id, id));
    }
}
