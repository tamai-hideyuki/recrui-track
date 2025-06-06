import * as dotenv from "dotenv";
dotenv.config();

import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = path.resolve(__dirname, "../../../recrui-track.db");

// DEBUG: 実際に開いている DB の絶対パスを出力
console.log(`⏱️ DEBUG: Opening SQLite file at → ${dbPath}`);

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
