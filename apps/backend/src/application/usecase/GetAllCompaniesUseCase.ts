import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

export class GetAllCompaniesUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(): Promise<CompanyOutput[]> {
        const entities = await this.repo.findAll();
        return entities.map((r): CompanyOutput => ({
            id:          r.id,
            name:        r.name,
            industry:    r.industry,
            url:         r.url,
            appliedDate: r.appliedDate.getTime(),
            status:      r.status,
            memo:        r.memo ?? undefined,
            createdAt:   r.createdAt.getTime(),
            updatedAt:   r.updatedAt.getTime(),
        }));
    }
}