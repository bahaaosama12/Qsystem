import { getBranchById, getBranches as getBranchesRepository } from "../repositories/branch.repository.js";

export const getBranches = async (cityId?: number, governorateId?: number) => {
  return await getBranchesRepository(cityId, governorateId);
};

export const getBranch = async (branchId: number) => getBranchById(branchId);
