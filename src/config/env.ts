export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  databaseSslMode: process.env.DATABASE_SSL_MODE ?? "disable",
};
