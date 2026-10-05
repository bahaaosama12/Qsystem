import { getCitiesByGovernorate } from "../repositories/city.repository.js";

export const getCities = async (governorateId: number) => {
  return await getCitiesByGovernorate(governorateId);
};