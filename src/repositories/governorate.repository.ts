import pool from "../config/database.js";

export const getAllGovernorates = async () => {
  const result = await pool.query(`
    SELECT id, name_en, name_ar
    FROM governorates
    ORDER BY id;
  `);

  return result.rows;
};