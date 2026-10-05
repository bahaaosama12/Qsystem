import type { Request, Response } from "express";
import { getDepartments } from "../services/department.service.js";

const getDepartmentsController = async (req: Request, res: Response) => {
  const departments = await getDepartments();

  res.status(200).json({
    data: departments,
  });
};

export { getDepartmentsController };
