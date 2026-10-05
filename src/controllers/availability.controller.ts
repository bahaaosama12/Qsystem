import type { Request, Response } from "express";
import { getAvailability } from "../services/availability.service.js";

const getAvailabilityController = async (req: Request, res: Response) => {
  const branchId = Number(req.query.branchId);
  const departmentId = Number(req.query.departmentId);
  const date = String(req.query.date);

  const availableSlots = await getAvailability(branchId, departmentId, date);

  res.status(200).json({
    data: availableSlots,
  });
};

export { getAvailabilityController };
