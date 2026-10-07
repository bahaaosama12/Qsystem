# QSystem V1

QSystem V1 provides governorate, city, and branch reference data plus the existing application APIs. POS devices and booking records are intentionally not included in the V1 seed.

## Requirements

- Node.js 22 or later
- PostgreSQL 15 or later

## Clean setup

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create your local environment file:

   ```sh
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

4. Create an empty PostgreSQL database and set these values in `.env`:

   - `DATABASE_URL`: PostgreSQL connection URL, for example `postgresql://USER:PASSWORD@HOST:5432/DATABASE`
   - `PORT`: HTTP port (defaults to `3000`)

5. Apply the schema migrations:

   ```sh
   npm run db:migrate
   ```

6. Load the approved V1 reference data:

   ```sh
   npm run db:seed
   ```

   The seed is repeatable and does not create POS devices or bookings.

7. Validate the database baseline:

   ```sh
   npm run db:check
   ```

8. Run the smoke tests and start the application:

   ```sh
   npm test
   npm run build
   npm start
   ```

The development server can be started with `npm run dev`. The health endpoint is `GET /health`; it returns HTTP 200 only when PostgreSQL is reachable.

## Database files

- `db/migrations/` contains ordered, transactional schema migrations. The branch coordinate migration adds nullable `latitude` and `longitude` columns as `NUMERIC(11,8)`.
- `db/seed/v1-data.json` is the approved V1 snapshot: 27 governorates, 240 cities, 4 classifications, and 379 active branches with three-digit codes and coordinates. It also includes the current department, service, class/service, and booking settings reference data required by the existing application. It contains no POS or booking rows.

The database check is read-only. It validates the expected V1 counts, branch code sequence/uniqueness, relationships, cities with branches, classifications, coordinates, and active branch status.
