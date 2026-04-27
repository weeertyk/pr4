# Supabase Setup for MVP

## 1. Create project

1. Create a project in `Supabase`
2. Copy:
   - project URL
   - anon key
   - service role key
   - database password

## 2. Prepare local env

Create `.env.local` from `.env.example` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTESERVICE_API_KEY`

Recommended setup:

- the project now uses `Supabase SQL + supabase-js`
- schema is managed by SQL files in `supabase/sql/`
- app runtime uses Supabase API keys instead of a direct Postgres connection from the app layer

## 3. Enable extensions

Run SQL from:

- `supabase/sql/001_extensions.sql`

Then run:

- `supabase/sql/002_schema.sql`
- `supabase/sql/003_geo_functions.sql`
- `supabase/sql/004_seed.sql`

## 4. Data Layer

Note:

- geo columns use `PostGIS`
- schema is managed through SQL files in `supabase/sql/`
- geo queries go through SQL functions / RPC in `Supabase`
- application reads and writes data through `supabase-js`

## 5. First useful checks

1. call `places_nearby`
2. call `places_in_bounds`
3. call `risk_zone_for_point`
4. verify demo data in:
   - `users`
   - `places`
   - `trip_plans`
   - `recommendations`
