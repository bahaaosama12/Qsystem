import pool from "../config/database.js";
import type { PoolClient } from "pg";

export const getBranchesByCity = async (cityId: number) => {
  const result = await pool.query(
    `
      SELECT id, branch_code, name, status
      FROM branches
      WHERE city_id = $1
        AND status = 'ACTIVE'
      ORDER BY id;
    `,
    [cityId]
  );

  return result.rows;
};

export const getActiveBranch = async (
  client: PoolClient,
  branchId: number
) => {
  const result = await client.query(
    `
      SELECT id, status
      FROM branches
      WHERE id = $1
        AND status = 'ACTIVE';
    `,
    [branchId]
  );

  return result.rows[0];
};

export const checkBranchService = async (
  client: PoolClient,
  branchId: number,
  serviceId: number
) => {
  const result = await client.query(
    `
      SELECT b.id
      FROM branches b
      JOIN branch_class_services bcs
        ON b.class_id = bcs.branch_class_id
      WHERE b.id = $1
        AND bcs.service_id = $2;
    `,
    [branchId, serviceId]
  );

  return result.rows[0];
};