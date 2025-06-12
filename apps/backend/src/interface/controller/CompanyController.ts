import { Context } from "hono";
import {
    GetAllCompaniesUseCase,
    GetCompanyByIdUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
} from "../../application/usecase";
import { CreateCompanyInputSchema, UpdateCompanyInputSchema } from "../../application/dto";
import type { CompanyRepositoryPort } from "../../application/port";
import { DrizzleCompanyRepository } from "../../infrastructure/repository/DrizzleCompanyRepository";

const repo: CompanyRepositoryPort = new DrizzleCompanyRepository();
const useCases = {
    list:   new GetAllCompaniesUseCase(repo),
    get:    new GetCompanyByIdUseCase(repo),
    create: new CreateCompanyUseCase(repo),
    update: new UpdateCompanyUseCase(repo),
    delete: new DeleteCompanyUseCase(repo),
};
const schemas = { create: CreateCompanyInputSchema, update: UpdateCompanyInputSchema };

export class CompanyController {
    static async getAll(c: Context) {
        const list = await useCases.list.execute();
        return c.json(list);
    }

    static async getById(c: Context) {
        const id = c.req.param("id");
        const company = await useCases.get.execute(id);
        return company
            ? c.json(company)
            : c.text("Not Found", 404);
    }

    static async create(c: Context) {
        const body = await c.req.json();
        const parsed = schemas.create.safeParse(body);
        if (!parsed.success) {
            return c.json(parsed.error.format(), 400);
        }
        const created = await useCases.create.execute(parsed.data);
        return c.json(created, 201);
    }

    static async update(c: Context) {
        const id = c.req.param("id");
        const body = await c.req.json();
        const parsed = schemas.update.safeParse({ id, ...body });
        if (!parsed.success) {
            return c.json(parsed.error.format(), 400);
        }
        const updated = await useCases.update.execute(parsed.data);
        return updated
            ? c.json(updated)
            : c.text("Not Found", 404);
    }

    static async delete(c: Context) {
        const id = c.req.param("id");
        const existing = await useCases.get.execute(id);
        if (!existing) {
            return c.json({ message: "Not Found" }, 404);
        }
        await useCases.delete.execute(id);
        return c.status(204);
    }
}
