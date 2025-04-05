import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  host: String(process.env.PG_HOST),
  port: Number(process.env.PG_PORT),
  user: String(process.env.PG_USER),
  password: String(process.env.PG_PASSWORD),
  database: String(process.env.PG_DATABASE),
  ssl: String(process.env.PG_SSL) === "true",
});

export const postgres = drizzle(pool);