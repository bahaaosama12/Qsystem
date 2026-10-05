import { getAllDepartments } from "../repositories/department.repository.js";

export const getDepartments = async () => {
  return await getAllDepartments();
};