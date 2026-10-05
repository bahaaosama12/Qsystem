import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";
import { env } from "./config/env.js";

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function testConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
  }
}

testConnection();