import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

export class GetCompanyByIdUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(id: string): Promise<CompanyOutput | null> {
        const entity = await this.repo.findById(id);
        if (!entity) return null;

        return {
            id:          entity.id,
            name:        entity.name,
            industry:    entity.industry,
            url:         entity.url,
            appliedDate: entity.appliedDate.getTime(),
            status:      entity.status,
            memo:        entity.memo ?? undefined,
            createdAt:   entity.createdAt.getTime(),
            updatedAt:   entity.updatedAt.getTime(),
        };
    }
}