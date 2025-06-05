import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
export const DB_PATH = process.env.DB_PATH || "local.db";
