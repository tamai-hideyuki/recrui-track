import type { Config } from "drizzle-kit";

const config: Config = {

    dialect: "sqlite",

    // schema は配列で渡す
    schema: ["src/infrastructure/db/schema.ts"],

    // 出力先もプロジェクトルートからの相対パス
    out: "drizzle/migrations",

    // DB ファイルへの接続情報
    dbCredentials: {
        url: "file:./src/infrastructure/db/recrui-track.db",
    },
};

export default config;
