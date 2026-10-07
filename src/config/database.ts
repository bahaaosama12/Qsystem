import { Pool } from "pg";
import { env } from "./env.js";

if (env.databaseSslMode !== "disable" && env.databaseSslMode !== "require") {
  throw new Error("DATABASE_SSL_MODE must be 'disable' or 'require'");
}

const pool = new Pool({
  connectionString: env.databaseUrl,
  ...(env.databaseSslMode === "require"
    // Render's internal PostgreSQL TLS uses self-signed certificates.
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export default pool;
