import type { Request, Response } from "express";
import {
  createBooking,
  getActiveBooking,
  cancelBooking,
  updateBooking ,
} from "../services/booking.service.js";

const createBookingController = async (req: Request, res: Response) => {
  const booking = await createBooking(req.body);

  res.status(201).json({
    data: booking,
  });
};

const getActiveBookingController = async (req: Request, res: Response) => {
  const { nationalId, phone } = req.body;

  const booking = await getActiveBooking(nationalId, phone);

  res.status(200).json({
    data: booking ?? null,
  });
};


const cancelBookingController = async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);

  const booking = await cancelBooking(bookingId);

  res.status(200).json({
    data: booking,
  });
};

const updateBookingController = async (
  req: Request,
  res: Response,
) => {
  const bookingId = Number(req.params.id);

  const { appointmentDate, appointmentTime } = req.body;

  const booking = await updateBooking(
    bookingId,
    appointmentDate,
    appointmentTime,
  );

  res.status(200).json({
    data: booking,
  });
};

export { createBookingController, getActiveBookingController,cancelBookingController,updateBookingController };
