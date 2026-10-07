import type { Request, Response } from "express";
import { getBranch, getBranches } from "../services/branch.service.js";

const getBranchesController = async (req: Request, res: Response) => {
  const cityId = req.query.cityId === undefined ? undefined : Number(req.query.cityId);
  const governorateId = req.query.governorateId === undefined ? undefined : Number(req.query.governorateId);
  if ((cityId !== undefined && !Number.isInteger(cityId)) || (governorateId !== undefined && !Number.isInteger(governorateId))) {
    return res.status(400).json({ message: "INVALID_LOCATION_ID" });
  }
  const branches = await getBranches(cityId, governorateId);

  return res.status(200).json({
    data: branches,
  });
};

const getBranchController = async (req: Request, res: Response) => {
  const branchId = Number(req.params.id);
  if (!Number.isInteger(branchId) || branchId < 1) {
    return res.status(400).json({ message: "INVALID_BRANCH_ID" });
  }
  const branch = await getBranch(branchId);
  if (!branch) return res.status(404).json({ message: "BRANCH_NOT_FOUND" });
  return res.status(200).json({ data: branch });
};

export { getBranchesController, getBranchController };
