import { CreateCompanyInput } from "../dto/CreateCompanyInput";
import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";
import { Company } from "../../domain/entity/Company";

export class CreateCompanyUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(input: CreateCompanyInput): Promise<CompanyOutput> {
        // ドメインエンティティを生成（appliedDate を Date に変換）
        const entity = Company.createNew(
            input.name,
            input.industry,
            input.url,
            new Date(input.appliedDate),
            input.status,
            input.memo
        );

        // 永続化
        await this.repo.save(entity);

        // 出力用 DTO にマッピング
        return {
            id:          entity.id,
            name:        entity.name,
            industry:    entity.industry,
            url:         entity.url,
            appliedDate: entity.appliedDate.getTime(),
            status:      entity.status,
            memo:        entity.memo,
            createdAt:   entity.createdAt.getTime(),
            updatedAt:   entity.updatedAt.getTime(),
        };
    }
}