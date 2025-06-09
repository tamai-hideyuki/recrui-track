import { v4 as uuidv4 } from "uuid";

export type CompanyStatus =
    | "未応募"
    | "応募済"
    | "選考中"
    | "内定"
    | "辞退";

export class Company {
    readonly id: string;
    name: string;
    industry: string;
    appliedDate: Date;
    status: CompanyStatus;
    memo?: string;

    private constructor(
        id: string,
        name: string,
        industry: string,
        appliedDate: Date,
        status: CompanyStatus,
        memo?: string
    ) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.appliedDate = appliedDate;
        this.status = status;
        this.memo = memo;
    }

    /** 新規 Company 作成 */
    static createNew(
        name: string,
        industry: string,
        appliedDate: Date,
        status: CompanyStatus,
        memo?: string
    ): Company {
        return new Company(uuidv4(), name, industry, appliedDate, status, memo);
    }

    /** プロパティ更新 */
    update(
        name: string,
        industry: string,
        appliedDate: Date,
        status: CompanyStatus,
        memo?: string
    ) {
        this.name = name;
        this.industry = industry;
        this.appliedDate = appliedDate;
        this.status = status;
        this.memo = memo;
    }
}