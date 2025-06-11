import { CompanyRepositoryPort } from "../port/CompanyRepositoryPort";

/**
 * Company の削除ユースケース
 * 成功したら true、存在しなければ false を返す
 */
export class DeleteCompanyUseCase {
    constructor(private repo: CompanyRepositoryPort) {}

    async execute(id: string): Promise<boolean> {
        const entity = await this.repo.findById(id);
        if (!entity) {
            return false;
        }
        await this.repo.deleteById(id);
        return true;
    }
}
