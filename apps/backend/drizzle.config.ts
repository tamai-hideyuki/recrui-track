import type { Config } from "drizzle-kit"

const config: Config = {

    dialect: "sqlite",

    schema: "./src/infrastructure/db/schema.ts",

    out: "./drizzle",

    dbCredentials: {
        url: "file:./recrui-track.db",
    },
}

export default config
