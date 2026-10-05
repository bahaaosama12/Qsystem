import type { Request, Response } from "express";
import { getBranches } from "../services/branch.service.js";

const getBranchesController = async (req: Request, res: Response) => {
  const cityId = Number(req.query.cityId);

  const branches = await getBranches(cityId);

  res.status(200).json({
    data: branches,
  });
};

export { getBranchesController };
