import { Company } from "../../domain/entity/Company";

/**
 * Company の永続化操作を定義するポートインターフェイス
 */
export interface CompanyRepositoryPort {
    /** 全企業を取得 */
    findAll(): Promise<Company[]>;

    /** ID で単一取得 */
    findById(id: string): Promise<Company | null>;

    /** 新規作成または更新 */
    save(entity: Company): Promise<void>;

    /** ID で削除 */
    deleteById(id: string): Promise<void>;
}
