import pool from "../config/database.js";

export const getBookingSettings = async () => {
  const result = await pool.query(`
    SELECT opening_time, closing_time, slot_interval
    FROM system_settings
    LIMIT 1;
  `);

  return result.rows[0];
};

export const getBookedTimes = async (
  branchId: number,
  departmentId: number,
  date: string
) => {
  const result = await pool.query(
    `
      SELECT appointment_time
      FROM bookings
      WHERE branch_id = $1
        AND department_id = $2
        AND appointment_date = $3
        AND status = 'CONFIRMED'
      ORDER BY appointment_time;
    `,
    [branchId, departmentId, date]
  );

  return result.rows;
};