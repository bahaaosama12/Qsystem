import { getAllGovernorates } from "../repositories/governorate.repository.js";

export const getGovernorates = async () => {
  return await getAllGovernorates();
};