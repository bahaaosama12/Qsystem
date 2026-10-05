import pool from "../config/database.js";

export const getAllDepartments = async () => {
  const result = await pool.query(`
    SELECT id, name_en, name_ar
    FROM departments
    WHERE is_active = true
    ORDER BY id;
  `);

  return result.rows;
};