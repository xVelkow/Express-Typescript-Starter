import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/features/**/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: String(process.env.PG_HOST),
    port: Number(process.env.PG_PORT),
    user: String(process.env.PG_USER),
    password: String(process.env.PG_PASSWORD),
    database: String(process.env.PG_DATABASE),
    ssl: String(process.env.PG_SSL) === "true",
  },
});