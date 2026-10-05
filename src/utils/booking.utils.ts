export const isBookingExpired = (
  appointmentDate: string,
  appointmentTime: string,
) => {
  const appointmentDateTime = new Date(
    `${appointmentDate}T${appointmentTime}`,
  );

  const now = new Date();

  return appointmentDateTime <= now;
};

export const getQueueNumberFromTime = (
  appointmentTime: string,
  openingTime: string,
  slotInterval: number,
) => {
  const [appointmentHours, appointmentMinutes] =
    appointmentTime.split(":").map(Number);

  const [openingHours, openingMinutes] =
    openingTime.split(":").map(Number);

  const appointmentTotalMinutes =
    appointmentHours! * 60 + appointmentMinutes!;

  const openingTotalMinutes =
    openingHours! * 60 + openingMinutes!;

  return (
    (appointmentTotalMinutes - openingTotalMinutes) /
      slotInterval +
    1
  );
};