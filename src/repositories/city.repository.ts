import pool from "../config/database.js";

export const getCitiesByGovernorate = async (governorateId: number) => {
  const result = await pool.query(
    `
      SELECT id, name_en, name_ar
      FROM cities
      WHERE governorate_id = $1
      ORDER BY id;
    `,
    [governorateId]
  );

  return result.rows;
};