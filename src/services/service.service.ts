import { getServicesByDepartment } from "../repositories/service.repository.js";

export const getServices = async (departmentId: number) => {
  return await getServicesByDepartment(departmentId);
};