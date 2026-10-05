import { getBranchesByCity } from "../repositories/branch.repository.js";

export const getBranches = async (cityId: number) => {
  return await getBranchesByCity(cityId);
};