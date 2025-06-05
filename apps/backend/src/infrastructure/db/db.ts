import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// DB_PATH は .envから読み取り possible
const sqlite = new Database("local.db");
export const db = drizzle(sqlite, { schema });
