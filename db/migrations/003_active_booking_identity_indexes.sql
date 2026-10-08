CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_national_id
  ON bookings (national_id)
  WHERE status = 'CONFIRMED';

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_phone
  ON bookings (phone)
  WHERE status = 'CONFIRMED';

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_slot
  ON bookings (branch_id, department_id, appointment_date, appointment_time)
  WHERE status = 'CONFIRMED';
