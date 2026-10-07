import "dotenv/config";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import app from "../dist/app.js";
import pool from "../dist/config/database.js";

let server;
let baseUrl;

before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await pool.end();
});

test("application starts and PostgreSQL health check succeeds", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", database: "ok" });
});

test("branches are readable by ID and filterable by city and governorate", async () => {
  const refs = await pool.query(`
    SELECT b.id, b.city_id, c.governorate_id
    FROM branches b JOIN cities c ON c.id=b.city_id
    ORDER BY b.id LIMIT 1
  `);
  assert.equal(refs.rowCount, 1);
  const { id, city_id: cityId, governorate_id: governorateId } = refs.rows[0];

  const listResponse = await fetch(`${baseUrl}/api/branches`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert(list.data.some((branch) => branch.id === id));

  const byIdResponse = await fetch(`${baseUrl}/api/branches/${id}`);
  assert.equal(byIdResponse.status, 200);
  const byId = await byIdResponse.json();
  assert.equal(byId.data.id, id);

  const cityResponse = await fetch(`${baseUrl}/api/branches?cityId=${cityId}`);
  assert.equal(cityResponse.status, 200);
  const cityBranches = await cityResponse.json();
  assert(cityBranches.data.some((branch) => branch.id === id));
  const expectedCityIds = (await pool.query("SELECT id FROM branches WHERE city_id=$1 AND status='ACTIVE' ORDER BY id", [cityId])).rows.map((row) => row.id);
  assert.deepEqual(cityBranches.data.map((branch) => branch.id), expectedCityIds);

  const govResponse = await fetch(`${baseUrl}/api/branches?governorateId=${governorateId}`);
  assert.equal(govResponse.status, 200);
  const govBranches = await govResponse.json();
  assert(govBranches.data.some((branch) => branch.id === id));
  const expectedGovIds = (await pool.query("SELECT b.id FROM branches b JOIN cities c ON c.id=b.city_id WHERE c.governorate_id=$1 AND b.status='ACTIVE' ORDER BY b.id", [governorateId])).rows.map((row) => row.id);
  assert.deepEqual(govBranches.data.map((branch) => branch.id), expectedGovIds);
});
