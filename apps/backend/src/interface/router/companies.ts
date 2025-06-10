import { Hono } from "hono";
import { CompanyController } from "../controller/CompanyController";

const companyRouter = new Hono();

companyRouter.get("/companies", CompanyController.getAll);
companyRouter.post("/companies", CompanyController.create);
companyRouter.put("/companies/:id", CompanyController.update);
companyRouter.delete("/companies/:id", CompanyController.delete);

export default companyRouter;
