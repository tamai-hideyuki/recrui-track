export interface CompanyResponseDto {
    id: string;
    name: string;
    industry: string;
    appliedDate: number;
    status: string;
    memo?: string;
    createdAt: number;
    updatedAt: number;
}
