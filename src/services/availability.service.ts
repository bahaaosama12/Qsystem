import {
  getBookingSettings,
  getBookedTimes,
} from "../repositories/availability.repository.js";

const generateTimeSlots = (
  openingTime: string,
  closingTime: string,
  interval: number,
  bookedTimes: string[]
) => {
  const slots: string[] = [];

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours! * 60 + minutes!;
  };

  let currentMinutes = toMinutes(openingTime);
  const closingMinutes = toMinutes(closingTime);

  while (currentMinutes <= closingMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;

    const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    if (!bookedTimes.includes(time)) {
      slots.push(time);
    }

    currentMinutes += interval;
  }

  return slots;
};

export const getAvailability = async (
  branchId: number,
  departmentId: number,
  date: string
) => {
  const settings = await getBookingSettings();

  const bookedRows = await getBookedTimes(
    branchId,
    departmentId,
    date
  );

  const bookedTimes = bookedRows.map((row) =>
    row.appointment_time.slice(0, 5)
  );

  const availableSlots = generateTimeSlots(
    settings.opening_time,
    settings.closing_time,
    settings.slot_interval,
    bookedTimes
  );

  return availableSlots;
};