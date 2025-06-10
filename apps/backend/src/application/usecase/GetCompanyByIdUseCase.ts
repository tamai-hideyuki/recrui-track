import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

export class GetCompanyByIdUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(id: string): Promise<CompanyOutput | null> {
        const e = await this.repo.findById(id);
        if (!e) return null;
        return {
            id: e.id,
            name: e.name,
            industry: e.industry,
            appliedDate: e.appliedDate.getTime(),
            status: e.status,
            memo: e.memo,
            createdAt: e['createdAt']?.getTime() ?? 0,
            updatedAt: e['updatedAt']?.getTime() ?? 0,
        };
    }
}