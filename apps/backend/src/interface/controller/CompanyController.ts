import { Context } from "hono";
import { z } from "zod";

// バレルから一括インポート
import {
    GetAllCompaniesUseCase,
    GetCompanyByIdUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
} from "../../application/usecase";
import {
    CreateCompanyInputSchema,
    UpdateCompanyInputSchema,
} from "../../application/dto";
import type { CompanyRepositoryPort } from "../../application/port";
import { DrizzleCompanyRepository } from "../../infrastructure/repository/DrizzleCompanyRepository";

const repo: CompanyRepositoryPort = new DrizzleCompanyRepository();

// UseCase をまとめてオブジェクト化
const useCases = {
    list:   new GetAllCompaniesUseCase(repo),
    get:    new GetCompanyByIdUseCase(repo),
    create: new CreateCompanyUseCase(repo),
    update: new UpdateCompanyUseCase(repo),
    delete: new DeleteCompanyUseCase(repo),
};

// スキーマもまとめてオブジェクト化
const schemas = {
    create: CreateCompanyInputSchema,
    update: UpdateCompanyInputSchema,
};

export class CompanyController {
    static async getAll(c: Context) {
        const list = await useCases.list.execute();
        return c.json(list);
    }

    static async getById(c: Context) {
        const id = c.req.param("id");
        const res = await useCases.get.execute(id);
        if (!res) return c.text("Not found", { status: 404 });
        return c.json(res);
    }

    static async create(c: Context) {
        const body = await c.req.json();
        const parsed = schemas.create.safeParse(body);
        if (!parsed.success) {
            return c.json(parsed.error.format(), { status: 400 });
        }
        const res = await useCases.create.execute(parsed.data);
        return c.json(res, { status: 201 });
    }

    static async update(c: Context) {
        const id = c.req.param("id");
        const body = await c.req.json();
        const parsed = schemas.update.safeParse({ id, ...body });
        if (!parsed.success) {
            return c.json(parsed.error.format(), { status: 400 });
        }
        const res = await useCases.update.execute(parsed.data);
        if (!res) return c.text("Not found", { status: 404 });
        return c.json(res);
    }

    static async delete(c: Context) {
        try {
            const id = c.req.param("id");
            const existing = await useCases.get.execute(id);
            if (!existing) {
                return c.json({ message: "Not Found" }, { status: 404 });
            }
            await useCases.delete.execute(id);
            return new Response(null, { status: 204 });
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal Server Error" }, { status: 500 });
        }
    }
}
