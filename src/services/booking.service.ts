import pool from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import {
  getActiveBranch,
  checkBranchService,
} from "../repositories/branch.repository.js";
import {
  insertBooking,
  getActiveBooking as getActiveBookingRepository,
  cancelBooking as cancelBookingRepository,
  getBookingById,
  getBookingByIdForUpdate,
  checkBookingSlot,
  findActiveBookingByNationalIdOrPhone,
  updateBooking as updateBookingRepository,
  expireBookings as expireBookingsRepository,
} from "../repositories/booking.repository.js";
import { getBookingSettings } from "../repositories/availability.repository.js";
import { isBookingExpired ,getQueueNumberFromTime } from "../utils/booking.utils.js";

type CreateBookingData = {
  nationalId: string;
  phone: string;
  branchId: number;
  departmentId: number;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
};

const getEgyptDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

export const createBooking = async (bookingData: CreateBookingData) => {
  const {
    nationalId,
    phone,
    branchId,
    departmentId,
    serviceId,
    appointmentDate,
    appointmentTime,
  } = bookingData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const activeBooking = await findActiveBookingByNationalIdOrPhone(
      nationalId,
      phone,
    );

    if (activeBooking) {
      throw new AppError("ACTIVE_BOOKING_EXISTS", 409);
    }

    const branch = await getActiveBranch(client, branchId);

    if (!branch) {
      throw new AppError("BRANCH_NOT_AVAILABLE", 404);
    }

    const branchService = await checkBranchService(
      client,
      branchId,
      serviceId,
    );

    if (!branchService) {
      throw new AppError("SERVICE_NOT_AVAILABLE", 400);
    }

    const settings = await getBookingSettings();

    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const appointmentMinutes = hours! * 60 + minutes!;

    const openingMinutes =
      Number(settings.opening_time.slice(0, 2)) * 60 +
      Number(settings.opening_time.slice(3, 5));

    const closingMinutes =
      Number(settings.closing_time.slice(0, 2)) * 60 +
      Number(settings.closing_time.slice(3, 5));

    const difference = appointmentMinutes - openingMinutes;

    if (
      difference < 0 ||
      appointmentMinutes > closingMinutes ||
      difference % settings.slot_interval !== 0
    ) {
      throw new AppError("INVALID_APPOINTMENT_TIME", 400);
    }

    const today = getEgyptDate();

    if (appointmentDate < today) {
      throw new AppError("INVALID_APPOINTMENT_DATE", 400);
    }

    const maxDate = new Date(`${today}T00:00:00`);

    maxDate.setDate(maxDate.getDate() + 15);

    const maxDateString = maxDate.toISOString().split("T")[0]!;

    if (appointmentDate > maxDateString) {
      throw new AppError("INVALID_APPOINTMENT_DATE", 400);
    }

const queueNumber = getQueueNumberFromTime(
  appointmentTime,
  settings.opening_time,
  settings.slot_interval,
);

    const booking = await insertBooking(
      client,
      nationalId,
      phone,
      branchId,
      departmentId,
      serviceId,
      appointmentDate,
      appointmentTime,
      queueNumber,
    );

    await client.query("COMMIT");

    return booking;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getActiveBooking = async (
  nationalId: string,
  phone: string,
) => {
  const booking = await getActiveBookingRepository(
    nationalId,
    phone,
  );

  if (!booking) {
    const bookingWithMatchingIdentity =
      await findActiveBookingByNationalIdOrPhone(
        nationalId,
        phone,
      );

    if (bookingWithMatchingIdentity) {
      throw new AppError("BOOKING_IDENTITY_MISMATCH", 409);
    }

    return null;
  }

  const queuePrefix =
    booking.department_name === "Customer Service"
      ? "C"
      : "T";

  return {
    ...booking,
    queue_code: `${queuePrefix}${booking.queue_number}`,
  };
};

export const cancelBooking = async (bookingId: number) => {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw new AppError("BOOKING_NOT_FOUND", 404);
  }

  if (
    isBookingExpired(
      booking.appointment_date,
      booking.appointment_time,
    )
  ) {
    throw new AppError("BOOKING_TIME_PASSED", 400);
  }

  const cancelledBooking = await cancelBookingRepository(bookingId);

  if (!cancelledBooking) {
    throw new AppError("BOOKING_NOT_CANCELLABLE", 400);
  }

  return cancelledBooking;
};

export const updateBooking = async (
  bookingId: number,
  appointmentDate: string,
  appointmentTime: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const booking = await getBookingByIdForUpdate(
      client,
      bookingId,
    );

    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", 404);
    }

    if (booking.status !== "CONFIRMED") {
      throw new AppError("BOOKING_NOT_MODIFIABLE", 400);
    }

    if (
      isBookingExpired(
        booking.appointment_date,
        booking.appointment_time,
      )
    ) {
      throw new AppError("BOOKING_TIME_PASSED", 400);
    }

    const settings = await getBookingSettings();

    const [hours, minutes] = appointmentTime.split(":").map(Number);

    const appointmentMinutes =
      hours! * 60 + minutes!;

    const openingMinutes =
      Number(settings.opening_time.slice(0, 2)) * 60 +
      Number(settings.opening_time.slice(3, 5));

    const closingMinutes =
      Number(settings.closing_time.slice(0, 2)) * 60 +
      Number(settings.closing_time.slice(3, 5));

    const difference =
      appointmentMinutes - openingMinutes;

    if (
      difference < 0 ||
      appointmentMinutes > closingMinutes ||
      difference % settings.slot_interval !== 0
    ) {
      throw new AppError("INVALID_APPOINTMENT_TIME", 400);
    }

    const today = getEgyptDate();

    if (appointmentDate < today) {
      throw new AppError("INVALID_APPOINTMENT_DATE", 400);
    }

    const maxDate = new Date(`${today}T00:00:00`);

    maxDate.setDate(maxDate.getDate() + 15);

    const maxDateString =
      maxDate.toISOString().split("T")[0]!;

    if (appointmentDate > maxDateString) {
      throw new AppError("INVALID_APPOINTMENT_DATE", 400);
    }

    const existingBooking = await checkBookingSlot(
      client,
      booking.branch_id,
      booking.department_id,
      appointmentDate,
      appointmentTime,
      bookingId,
    );

    if (existingBooking) {
      throw new AppError("SLOT_NOT_AVAILABLE", 409);
    }

    const queueNumber = getQueueNumberFromTime(
      appointmentTime,
      settings.opening_time,
      settings.slot_interval,
    );

    const updatedBooking = await updateBookingRepository(
      client,
      bookingId,
      appointmentDate,
      appointmentTime,
      queueNumber,
    );

    if (!updatedBooking) {
      throw new AppError("BOOKING_NOT_MODIFIABLE", 400);
    }

    await client.query("COMMIT");

    return updatedBooking;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const expireBookings = async () => {
  return await expireBookingsRepository();
};