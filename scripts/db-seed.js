import "dotenv/config";
import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(path.join(root, "db", "seed", "v1-data.json"), "utf8"));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function upsert(client, table, rows, columns, conflictColumns = ["id"]) {
  for (const row of rows) {
    const values = columns.map((column) => row[column]);
    const markers = values.map((_, i) => `$${i + 1}`);
    const updates = columns.filter((column) => !conflictColumns.includes(column));
    const conflict = conflictColumns.join(", ");
    const action = updates.length
      ? `DO UPDATE SET ${updates.map((column) => `${column} = EXCLUDED.${column}`).join(", ")}`
      : "DO NOTHING";
    const idOverride = columns.includes("id") ? " OVERRIDING SYSTEM VALUE" : "";
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")})${idOverride} VALUES (${markers.join(", ")}) ON CONFLICT (${conflict}) ${action}`,
      values,
    );
  }
}

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await upsert(client, "governorates", data.governorates, ["id", "name_en", "name_ar"]);
    await upsert(client, "cities", data.cities, ["id", "name_en", "governorate_id", "name_ar"]);
    await upsert(client, "branch_classes", data.branchClasses, ["id", "name"]);
    await upsert(client, "departments", data.departments, ["id", "name_en", "is_active", "name_ar"]);
    await upsert(client, "services", data.services, ["id", "name_en", "department_id", "is_active", "name_ar"]);
    await upsert(client, "branch_class_services", data.branchClassServices, ["branch_class_id", "service_id"], ["branch_class_id", "service_id"]);
    await upsert(client, "branches", data.branches, ["id", "branch_code", "name", "city_id", "class_id", "status", "latitude", "longitude"]);
    await upsert(client, "system_settings", data.systemSettings, ["id", "opening_time", "closing_time", "slot_interval"]);
    for (const [table, baselineMaxId] of [["governorates", 27], ["cities", 240], ["branch_classes", 4], ["departments", 2], ["services", Math.max(...data.services.map((x) => x.id))], ["branches", 379], ["system_settings", 1]]) {
      await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM ${table}), $1), true)`, [baselineMaxId]);
    }
    await client.query("COMMIT");
    console.log("V1 seed applied (POS and bookings intentionally excluded).");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
