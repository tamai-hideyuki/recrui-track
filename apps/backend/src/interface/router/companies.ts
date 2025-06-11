// src/interface/router/companies.ts
import { Hono } from "hono";
import { CompanyController } from "../controller/CompanyController";

const router = new Hono();

/**
 * (1) 全企業取得
 * GET /api/companies
 */
router.get("/companies", (c) => CompanyController.getAll(c));

/**
 * (2) 単一企業取得
 * GET /api/companies/:id
 */
router.get("/companies/:id", (c) => CompanyController.getById(c));

/**
 * (3) 新規企業登録
 * POST /api/companies
 */
router.post("/companies", (c) => CompanyController.create(c));

/**
 * (4) 企業情報更新
 * PUT /api/companies/:id
 */
router.put("/companies/:id", (c) => CompanyController.update(c));

/**
 * (5) 企業削除
 * DELETE /api/companies/:id
 */
router.delete("/companies/:id", (c) => CompanyController.delete(c));

export default router;
