import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabasePool } from "./db-pool.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "db", "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const pool = createDatabasePool();
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  for (const name of files) {
    const prior = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name]);
    if (prior.rowCount) {
      console.log(`SKIP ${name} (already applied)`);
      continue;
    }
    const sql = await readFile(path.join(dir, name), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.log(`APPLIED ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
