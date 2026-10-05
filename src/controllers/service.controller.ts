import type { Request, Response } from "express";
import { getServices } from "../services/service.service.js";

const getServicesController = async (req: Request, res: Response) => {
  const departmentId = Number(req.query.departmentId);

  const services = await getServices(departmentId);

  res.status(200).json({
    data: services,
  });
};

export {
  getServicesController,
};