import { CreateCompanyInput } from "../dto/CreateCompanyInput";
import { CompanyOutput } from "../dto/CompanyOutput";
import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";
import { Company } from "../../domain/entity/Company";

export class CreateCompanyUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(input: CreateCompanyInput): Promise<CompanyOutput> {
        const entity = Company.createNew(
            input.name,
            input.industry,
            new Date(input.appliedDate),
            input.status as any,
            input.memo,
        );
        await this.repo.save(entity);
        return {
            id: entity.id,
            name: entity.name,
            industry: entity.industry,
            appliedDate: entity.appliedDate.getTime(),
            status: entity.status,
            memo: entity.memo,
            createdAt: entity['createdAt']?.getTime() ?? Date.now(),
            updatedAt: entity['updatedAt']?.getTime() ?? Date.now(),
        };
    }
}