import pg from "pg";

export const createDatabasePool = () => {
  const sslMode = process.env.DATABASE_SSL_MODE ?? "disable";

  if (sslMode !== "disable" && sslMode !== "require") {
    throw new Error("DATABASE_SSL_MODE must be 'disable' or 'require'");
  }

  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ...(sslMode === "require"
      // Render's internal PostgreSQL TLS uses self-signed certificates.
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
};
