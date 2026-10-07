import pool from "../config/database.js";
import type { PoolClient } from "pg";

export const getBranches = async (cityId?: number, governorateId?: number) => {
  const result = await pool.query(
    `
      SELECT b.id, b.branch_code, b.name, b.status
      FROM branches b
      JOIN cities c ON c.id = b.city_id
      WHERE ($1::integer IS NULL OR b.city_id = $1)
        AND ($2::integer IS NULL OR c.governorate_id = $2)
        AND b.status = 'ACTIVE'
      ORDER BY b.id;
    `,
    [cityId ?? null, governorateId ?? null]
  );

  return result.rows;
};

export const getBranchById = async (branchId: number) => {
  const result = await pool.query(
    "SELECT id, branch_code, name, city_id, class_id, status, latitude, longitude FROM branches WHERE id = $1",
    [branchId],
  );
  return result.rows[0] ?? null;
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
