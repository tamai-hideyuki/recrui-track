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


// マイグレーションの際は以下コマンドで。
// npx drizzle-kit generate --name add_url_to_companies
// npx drizzle-kit push
