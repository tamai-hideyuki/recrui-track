import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

export class GetAllCompaniesUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(): Promise<CompanyOutput[]> {
        const entities = await this.repo.findAll();
        return entities.map(e => ({
            id: e.id,
            name: e.name,
            industry: e.industry,
            appliedDate: e.appliedDate.getTime(),
            status: e.status,
            memo: e.memo,
            createdAt: e['createdAt']?.getTime() ?? 0,
            updatedAt: e['updatedAt']?.getTime() ?? 0,
        }));
    }
}