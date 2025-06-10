import { UpdateCompanyInput } from "../dto/UpdateCompanyInput";
import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

export class UpdateCompanyUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(input: UpdateCompanyInput): Promise<CompanyOutput | null> {
        const e = await this.repo.findById(input.id);
        if (!e) return null;
        e.update(
            input.name,
            input.industry,
            new Date(input.appliedDate),
            input.status as any,
            input.memo,
        );
        await this.repo.save(e);
        return {
            id: e.id,
            name: e.name,
            industry: e.industry,
            appliedDate: e.appliedDate.getTime(),
            status: e.status,
            memo: e.memo,
            createdAt: e['createdAt']?.getTime() ?? 0,
            updatedAt: e['updatedAt']?.getTime() ?? Date.now(),
        };
    }
}
