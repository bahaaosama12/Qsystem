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
- `NODE_ENV`: use `development` locally; Render sets `production`
- `DATABASE_SSL_MODE`: `disable` locally; Render uses `require` for encrypted internal PostgreSQL connections

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

## Render deployment preparation

`render.yaml` defines the public Node web service only. Create the Render PostgreSQL database separately so it can be initialized before the web service health check is enabled. Keep the database and web service in the same region; the Blueprint uses Frankfurt. The Blueprint requests `DATABASE_URL` during initial service setup and contains no database credentials. Choose the Render database plan in the Dashboard.

1. Create the Render PostgreSQL database in Frankfurt and copy its external connection URL for the one-time setup commands.
2. From a trusted local terminal, temporarily set `DATABASE_URL` to that external URL with `sslmode=verify-full`, then run `npm run db:migrate` and `npm run db:seed` once. The external URL must retain its hostname so TLS certificate verification works. Do not add these commands to the web service start command.
3. Create the web service from `render.yaml`. At the prompt, provide the database's internal connection URL as `DATABASE_URL`.
4. Render sets `NODE_ENV=production` and `DATABASE_SSL_MODE=require`; the application enforces TLS for Render's internal self-signed database certificate. Local development defaults to no SSL unless configured otherwise.
5. The service builds with `npm ci --include=dev && npm run build` and starts with `npm start`. Render supplies `PORT`; the server already listens on it, falling back to `3000` locally. `/health` checks PostgreSQL connectivity.

Automatic deploys are disabled in the Blueprint so creating the configuration does not trigger future deploys on every push. No migration or seed runs when the application starts.
