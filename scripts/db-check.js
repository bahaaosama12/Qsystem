import "dotenv/config";
import { createDatabasePool } from "./db-pool.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = createDatabasePool();
let failed = false;
const report = (name, pass, detail) => {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}: ${detail}`);
  if (!pass) failed = true;
};
try {
  await pool.query("BEGIN READ ONLY");
  const r = await pool.query(`
    SELECT
      (SELECT count(*) FROM governorates)::int AS governorates,
      (SELECT count(*) FROM cities)::int AS cities,
      (SELECT count(*) FROM branches)::int AS branches,
      (SELECT count(*) FROM branches WHERE latitude IS NULL)::int AS missing_latitude,
      (SELECT count(*) FROM branches WHERE longitude IS NULL)::int AS missing_longitude,
      (SELECT count(*) FROM branches WHERE latitude < -90 OR latitude > 90 OR longitude < -180 OR longitude > 180)::int AS invalid_coordinates,
      (SELECT count(*) FROM branches b LEFT JOIN cities c ON c.id=b.city_id WHERE c.id IS NULL)::int AS orphan_branches,
      (SELECT count(*) FROM cities c LEFT JOIN governorates g ON g.id=c.governorate_id WHERE g.id IS NULL)::int AS orphan_cities,
      (SELECT count(*) FROM cities c LEFT JOIN branches b ON b.city_id=c.id WHERE b.id IS NULL)::int AS cities_without_branches,
      (SELECT count(*) FROM branches b LEFT JOIN branch_classes bc ON bc.id=b.class_id WHERE bc.id IS NULL OR bc.name NOT IN ('A','B','C','D'))::int AS invalid_classes,
      (SELECT count(*) FROM (SELECT branch_code FROM branches GROUP BY branch_code HAVING count(*)>1) x)::int AS duplicate_codes,
      (SELECT count(*) FROM branches WHERE branch_code !~ '^[0-9]{3}$' OR branch_code < '001' OR branch_code > '379')::int AS malformed_codes,
      (SELECT count(*) FROM branches)::int - (SELECT count(DISTINCT branch_code) FROM branches)::int AS duplicate_code_rows,
      (SELECT count(*) FROM branches WHERE status <> 'ACTIVE')::int AS non_active,
      (SELECT count(*) FROM (SELECT governorate_id,name_en FROM cities GROUP BY governorate_id,name_en HAVING count(*)>1) x)::int AS duplicate_cities,
      (SELECT count(*) FROM branches WHERE id IS NULL OR branch_code IS NULL OR name IS NULL OR city_id IS NULL OR class_id IS NULL OR status IS NULL)::int AS missing_required
  `);
  await pool.query("COMMIT");
  const x = r.rows[0];
  report("governorates", x.governorates === 27, `${x.governorates} (expected 27)`);
  report("cities", x.cities === 240, `${x.cities} (expected 240)`);
  report("branches", x.branches === 379, `${x.branches} (expected 379)`);
  report("branch codes 001-379, unique and three digits", !x.duplicate_codes && !x.malformed_codes && !x.duplicate_code_rows && x.branches === 379, `duplicates=${x.duplicate_codes}, invalid=${x.malformed_codes}`);
  report("branch required fields", x.missing_required === 0, `missing=${x.missing_required}`);
  report("city/governorate relationships", x.orphan_cities === 0, `orphan cities=${x.orphan_cities}`);
  report("branch/city relationships", x.orphan_branches === 0, `orphan branches=${x.orphan_branches}`);
  report("every city has a branch", x.cities_without_branches === 0, `empty cities=${x.cities_without_branches}`);
  report("branch classifications", x.invalid_classes === 0, `invalid=${x.invalid_classes}`);
  report("coordinates", x.missing_latitude === 0 && x.missing_longitude === 0 && x.invalid_coordinates === 0, `missing lat=${x.missing_latitude}, missing lon=${x.missing_longitude}, invalid=${x.invalid_coordinates}`);
  report("branch status is ACTIVE", x.non_active === 0, `non-active=${x.non_active}`);
  report("duplicate cities", x.duplicate_cities === 0, `duplicates=${x.duplicate_cities}`);
  console.log(failed ? "DATABASE CHECK FAILED" : "DATABASE CHECK PASSED");
  if (failed) process.exitCode = 1;
} catch (error) {
  await pool.query("ROLLBACK").catch(() => {});
  console.error("DATABASE CHECK FAILED", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
