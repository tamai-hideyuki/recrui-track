import { Context } from "hono";
import { DrizzleCompanyRepository } from "../infrastructure/repository/DrizzleCompanyRepository";
import { Company } from "../../domain/entity/Company";

const repo = new DrizzleCompanyRepository();

export class CompanyController {
    /** 全企業取得 */
    static async getAll(c: Context) {
        const list = await repo.findAll();
        return c.json(list);
    }

    /** 企業登録 */
    static async create(c: Context) {
        const { name, industry, appliedDate, status, memo } = await c.req.json();
        const entity = Company.createNew(
            name,
            industry,
            new Date(Number(appliedDate)),
            status,
            memo
        );
        await repo.save(entity);
        return c.json(entity, 201);
    }

    /** 企業情報更新 */
    static async update(c: Context) {
        const id = c.req.param("id");
        const body = await c.req.json();
        const existing = await repo.findById(id);
        if (!existing) return c.text("Not found", 404);
        existing.update(
            body.name,
            body.industry,
            new Date(Number(body.appliedDate)),
            body.status,
            body.memo
        );
        await repo.save(existing);
        return c.json(existing);
    }

    /** 企業削除 */
    static async delete(c: Context) {
        const id = c.req.param("id");
        await repo.deleteById(id);
        return c.text("Deleted", 204);
    }
}
