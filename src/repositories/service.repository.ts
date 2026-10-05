import pool from "../config/database.js";

export const getServicesByDepartment = async (departmentId: number) => {
  const result = await pool.query(
    `
      SELECT id, name_en, name_ar
      FROM services
      WHERE department_id = $1
        AND is_active = true
      ORDER BY id;
    `,
    [departmentId],
  );

  return result.rows;
};
