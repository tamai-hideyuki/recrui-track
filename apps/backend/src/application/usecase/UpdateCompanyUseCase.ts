import { UpdateCompanyInput } from "../dto/UpdateCompanyInput";
import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";
import { Company } from "../../domain/entity/Company";

export class UpdateCompanyUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(input: UpdateCompanyInput): Promise<CompanyOutput | null> {
        // 既存エンティティ取得
        const existing = await this.repo.findById(input.id);
        if (!existing) return null;

        // 再構築（createdAt は既存のまま、updatedAt を現在時刻に）
        const now = new Date();
        const updatedEntity = Company.reconstruct(
            existing.id,
            input.name,
            input.industry,
            input.url,
            new Date(input.appliedDate),
            input.status,
            input.memo,
            existing.createdAt,
            now
        );

        // 永続化
        await this.repo.save(updatedEntity);

        // 出力用 DTO にマッピング
        return {
            id:          updatedEntity.id,
            name:        updatedEntity.name,
            industry:    updatedEntity.industry,
            url:         updatedEntity.url,
            appliedDate: updatedEntity.appliedDate.getTime(),
            status:      updatedEntity.status,
            memo:        updatedEntity.memo,
            createdAt:   updatedEntity.createdAt.getTime(),
            updatedAt:   updatedEntity.updatedAt.getTime(),
        };
    }
}
