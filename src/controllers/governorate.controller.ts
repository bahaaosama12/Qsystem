import type { Request, Response } from "express";
import { getGovernorates } from "../services/governorate.service.js";

const getGovernoratesController = async (req: Request, res: Response) => {
  const governorates = await getGovernorates();

  res.status(200).json({
    data: governorates,
  });
};

export { getGovernoratesController };
