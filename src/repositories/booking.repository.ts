import type { PoolClient } from "pg";
import pool from "../config/database.js";

export const insertBooking = async (
  client: PoolClient,
  nationalId: string,
  phone: string,
  branchId: number,
  departmentId: number,
  serviceId: number,
  appointmentDate: string,
  appointmentTime: string,
  queueNumber: number,
) => {
  const result = await client.query(
    `
    INSERT INTO bookings (
      national_id,
      phone,
      branch_id,
      department_id,
      service_id,
      appointment_date,
      appointment_time,
      queue_number,
      status
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, 'CONFIRMED'
    )
    RETURNING *;
    `,
    [
      nationalId,
      phone,
      branchId,
      departmentId,
      serviceId,
      appointmentDate,
      appointmentTime,
      queueNumber,
    ],
  );

  return result.rows[0];
};

export const getActiveBooking = async (nationalId: string, phone: string) => {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.national_id,
      b.phone,
      b.branch_id,
      b.department_id,
      b.appointment_date,
      b.appointment_time,
      b.queue_number,
      b.status,
      br.name AS branch_name,
      d.name_en AS department_name_en,
      d.name_ar AS department_name_ar,
      s.name_en AS service_name_en,
      s.name_ar AS service_name_ar
      FROM bookings b 
      JOIN branches br ON b.branch_id = br.id
      JOIN departments d ON b.department_id = d.id
      JOIN services s ON b.service_id = s.id
      WHERE b.national_id = $1
      AND b.phone = $2
      AND b.status = 'CONFIRMED'; 
    `,
    [nationalId, phone],
  );

  return result.rows[0];
};

export const findActiveBookingByNationalIdOrPhone = async (
  nationalId: string,
  phone: string,
) => {
  const result = await pool.query(
    `
      SELECT *
      FROM bookings
      WHERE (national_id = $1 OR phone = $2)
        AND status = 'CONFIRMED';
    `,
    [nationalId, phone],
  );

  return result.rows[0];
};

export const cancelBooking = async (bookingId: number) => {
  const result = await pool.query(
    `
      UPDATE bookings
      SET status = 'CANCELLED'
      WHERE id = $1
        AND status = 'CONFIRMED'
      RETURNING *;
    `,
    [bookingId],
  );

  return result.rows[0];
};

export const getBookingById = async (bookingId: number) => {
  const result = await pool.query(
    `
      SELECT *
      FROM bookings
      WHERE id = $1;
    `,
    [bookingId],
  );

  return result.rows[0];
};

export const expireBookings = async () => {
  const result = await pool.query(`
    UPDATE bookings
    SET status = 'EXPIRED'
    WHERE status = 'CONFIRMED'
      AND (
        appointment_date + appointment_time
      ) <= NOW()
    RETURNING *;
  `);

  return result.rows;
};

export const updateBooking = async (
  client: PoolClient,
  bookingId: number,
  appointmentDate: string,
  appointmentTime: string,
  queueNumber: number,
) => {
  const result = await client.query(
    `
      UPDATE bookings
      SET
        appointment_date = $1,
        appointment_time = $2,
        queue_number = $3
      WHERE id = $4
        AND status = 'CONFIRMED'
      RETURNING *;
    `,
    [appointmentDate, appointmentTime, queueNumber, bookingId],
  );

  return result.rows[0];
};

export const checkBookingSlot = async (
  client: PoolClient,
  branchId: number,
  departmentId: number,
  appointmentDate: string,
  appointmentTime: string,
  bookingId: number,
) => {
  const result = await client.query(
    `
      SELECT id
      FROM bookings
      WHERE branch_id = $1
        AND department_id = $2
        AND appointment_date = $3
        AND appointment_time = $4
        AND status = 'CONFIRMED'
        AND id != $5;
    `,
    [branchId, departmentId, appointmentDate, appointmentTime, bookingId],
  );

  return result.rows[0];
};

export const getBookingByIdForUpdate = async (
  client: PoolClient,
  bookingId: number,
) => {
  const result = await client.query(
    `
      SELECT *
      FROM bookings
      WHERE id = $1
      FOR UPDATE;
    `,
    [bookingId],
  );

  return result.rows[0];
};
