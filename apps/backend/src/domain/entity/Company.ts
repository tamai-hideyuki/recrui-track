/** 募集ステータスの列挙型 */
export type CompanyStatus =
    | "未応募"
    | "カジュアル面談"
    | "書類選考中"
    | "応募済"
    | "選考中"
    | "一次選考"
    | "二次選考"
    | "三次選考"
    |"コーディングテスト"
    | "最終面接"
    | "内定"
    | "オファー面談"
    | "辞退"
    | "不採用";
/** ドメインエンティティ：企業 */
export class Company {
    private constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly industry: string,
        public readonly url: string,
        public readonly appliedDate: Date,
        public readonly status: CompanyStatus,
        public readonly memo: string | undefined,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    /** 再構築用：DB からの復元など */
    public static reconstruct(
        id: string,
        name: string,
        industry: string,
        url: string,
        appliedDate: Date,
        status: CompanyStatus,
        memo: string | undefined,
        createdAt: Date,
        updatedAt: Date
    ): Company {
        return new Company(
            id,
            name,
            industry,
            url,
            appliedDate,
            status,
            memo,
            createdAt,
            updatedAt
        );
    }

    /** 新規作成用ファクトリ */
    public static createNew(
        name: string,
        industry: string,
        url: string,
        appliedDate: Date,
        status: CompanyStatus,
        memo?: string
    ): Company {
        const now = new Date();
        return new Company(
            "", // ID はリポジトリ側で付与
            name,
            industry,
            url,
            appliedDate,
            status,
            memo,
            now,
            now
        );
    }
}
