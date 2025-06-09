import { Hono } from "hono";
import { CompanyController } from "../controller/CompanyController";

const app = new Hono();

app.get("/api/companies", CompanyController.getAll);
app.post("/api/companies", CompanyController.create);
app.put("/api/companies/:id", CompanyController.update);
app.delete("/api/companies/:id", CompanyController.delete);

export default app;
