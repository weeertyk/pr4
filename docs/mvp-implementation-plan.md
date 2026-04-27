# MVP AI Travel Companion: Plan Realization

## 1. Goal

Implement a free MVP of the `AI Travel Companion` based on:

- product and architecture notes from `D:\ISIS\nik\pr3.docx`
- existing wireframes already created in this project
- current codebase on `Next.js`

The MVP should demonstrate the core product value:

1. show the best next action for the traveler
2. adapt the plan when conditions change
3. help assess risk of places and areas
4. support map-based navigation

## 2. Current State of the Project

The project already contains a frontend skeleton with wireframe screens:

- onboarding
- dashboard
- safety
- map
- navigation
- settings
- trip recovery

Current stack in `pr4`:

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`

This means the best next step is not redesign, but turning the wireframes into a working MVP with real data, API routes, and domain logic.

## 3. MVP Scope

### Included in MVP

1. Onboarding with traveler preferences
2. Dashboard with `Best Next Action`
3. Nearby places list
4. Safety scanner for places/areas
5. Trip plan for the day
6. Trip recovery when an event breaks the original plan
7. Map screen with route preview
8. Settings for preferences

### Excluded from MVP

1. CRM integration
2. BPMS integration
3. Telegram bot
4. Paid AI APIs
5. Full offline city packages
6. Full moderator/admin panel
7. Push notifications
8. Complex ML models

## 4. Fixed Tech Stack

### Chosen stack

- Frontend: `Next.js + TypeScript + Tailwind + shadcn/ui`
- Backend: `Next.js Route Handlers`
- Database: `Supabase Postgres`
- Auth: `Supabase Auth`
- File storage: `Supabase Storage`
- Geospatial layer: `PostGIS` in `Supabase`
- DB access: `supabase-js` plus SQL/RPC for geo queries
- Maps: `MapLibre GL JS`
- Routing: `openrouteservice`
- Weather: `Open-Meteo`
- AI logic: rule-based recommendation engine
- Deploy: `Vercel`

### Why this stack

1. the stack matches your target production-like architecture better
2. `Supabase` gives Postgres, Auth, Storage and dashboard in one free ecosystem
3. `PostGIS` allows proper nearby search, viewport filtering and geo-based safety checks
4. `Vercel` is the natural deployment target for `Next.js`
5. the solution remains realistic for coursework and future scaling

### Note on PostGIS

`PostGIS` is useful and should be included in this MVP, but mainly for:

1. nearby places search
2. finding places inside current map bounds
3. distance-based recommendation scoring
4. area safety checks through polygons or zones

`PostGIS` is not the routing engine itself. For turn-by-turn route generation, the MVP should still use an external routing API such as `openrouteservice`, while `PostGIS` handles geo storage and geo queries inside the database.

## 5. Reduced Data Model for MVP

The original architecture contains more entities, but for MVP the model should be simplified.

### Core tables

1. `users`
2. `user_preferences`
3. `user_context`
4. `places`
5. `place_risks`
6. `risk_zones`
7. `trip_plans`
8. `trip_plan_items`
9. `events`
10. `recommendations`

### Deferred entities

1. `offline_packages`
2. `user_sessions`
3. `map_data` as a persistent table

These can be added later. For MVP, route data should be requested from external APIs on demand.

## 6. Suggested SQL Schema Structure

### `users`

- `id`
- `email`
- `name`
- `createdAt`
- `role`

### `user_preferences`

- `id`
- `userId`
- `budgetLevel`
- `preferenceMode`
- `travelStyles`
- `language`

### `user_context`

- `id`
- `userId`
- `location`
- `currentTime`
- `tripStatus`
- `weatherCode`
- `city`
- `country`
- `updatedAt`

### `places`

- `id`
- `name`
- `category`
- `location`
- `priceLevel`
- `rating`
- `isOpen`
- `description`
- `source`
- `externalPlaceId`

### `place_risks`

- `id`
- `placeId`
- `riskLevel`
- `riskScore`
- `reasons`
- `updatedAt`

### `risk_zones`

- `id`
- `name`
- `city`
- `riskLevel`
- `riskScore`
- `reasons`
- `area`
- `updatedAt`

### `trip_plans`

- `id`
- `userId`
- `date`
- `status`
- `createdAt`
- `updatedAt`

### `trip_plan_items`

- `id`
- `tripPlanId`
- `placeId`
- `startTime`
- `endTime`
- `position`
- `status`

### `events`

- `id`
- `tripPlanId`
- `type`
- `description`
- `relatedPlaceId`
- `timestamp`
- `severity`

### `recommendations`

- `id`
- `userId`
- `placeId`
- `actionType`
- `reason`
- `score`
- `contextSnapshot`
- `createdAt`

## 6.1 Geospatial Fields for PostGIS

For MVP with `Supabase + PostGIS`, several entities should use spatial types instead of plain numeric coordinates.

### Required geo fields

- `user_context.location` -> `geography(POINT, 4326)`
- `places.location` -> `geography(POINT, 4326)`
- `risk_zones.area` -> `geography(POLYGON, 4326)` or `geometry(POLYGON, 4326)`

### Optional mirrored fields

If needed for easier UI serialization, `latitude` and `longitude` may still be returned in API responses, but they should be derived from the PostGIS point, not stored as the primary source of truth.

## 7. Feature Mapping: Wireframes -> Domain Logic

### Onboarding screen

Purpose:
- collect traveler preferences

Needs:
- `user_preferences`
- save onboarding completion flag

### Dashboard screen

Purpose:
- show the best next action
- show nearby places

Needs:
- `user_context`
- `recommendations`
- `places`
- recommendation scoring service

### Safety screen

Purpose:
- assess place/area safety

Needs:
- `place_risks`
- `risk_zones`
- place lookup
- static safety advice

### Map screen

Purpose:
- show user position and nearby places

Needs:
- coordinates
- place markers
- map provider integration

### Navigation screen

Purpose:
- show route steps to selected place

Needs:
- route API
- origin and destination coordinates

### Trip recovery screen

Purpose:
- compare old plan vs rebuilt plan

Needs:
- `trip_plans`
- `trip_plan_items`
- `events`
- rebuild service

### Settings screen

Purpose:
- show and edit stored preferences

Needs:
- `users`
- `user_preferences`

## 8. MVP Business Logic

### 8.1 Best Next Action

The app should not depend on a paid LLM to select the next action.

Use a rule-based scoring algorithm:

`recommendationScore = distanceScore + budgetFit + openNowScore + weatherFit + safetyFit + preferenceFit`

Example factors:

- closer place -> higher score
- matching budget -> higher score
- open now -> required or strongly preferred
- low risk -> higher score
- indoor place when rain is expected -> higher score
- category aligned with traveler style -> higher score

Distance and nearest-place logic should be calculated with geo queries in `PostGIS`.

### 8.2 Trip Recovery

When an event occurs:

1. detect the affected place or timeslot
2. remove invalid or low-priority item
3. search for alternatives nearby
4. re-score alternatives
5. rebuild the plan while preserving as much of the original structure as possible

### 8.3 Safety Scanner

Safety can be implemented without AI at first:

1. store a risk score
2. store reasons
3. map score to labels:
   - `0-39` -> avoid
   - `40-69` -> caution
   - `70-100` -> safe

For place safety, use `place_risks`.
For area safety, use `risk_zones` and check whether the current point falls inside a polygon or near a risky zone.

## 9. API Plan

### Users and preferences

- `GET /api/user`
- `POST /api/onboarding`
- `PUT /api/preferences`

### Context

- `GET /api/context`
- `POST /api/context`

### Places

- `GET /api/places`
- `GET /api/places/nearby`
- `GET /api/places/in-bounds`
- `GET /api/places/:id`

### Safety

- `GET /api/places/:id/risk`
- `GET /api/safety/area`

### Recommendations

- `GET /api/recommendations/next`
- `GET /api/recommendations`
- `POST /api/recommendations/rebuild`

### Trip plan

- `GET /api/trip-plan/today`
- `POST /api/trip-plan`
- `PUT /api/trip-plan/:id`

### Events

- `POST /api/events`

## 10. Implementation Backlog

## Phase 1. Foundation

### Tasks

1. clean up frontend text encoding issues
2. create project structure for:
   - `features`
   - `lib`
   - `app/api`
   - `prisma`
3. connect project to `Supabase`
4. enable `PostGIS` in `Supabase`
5. create initial SQL schema
6. add seed data

### Result

The project runs locally and against `Supabase` with database-backed data.

## Phase 2. Domain and API

### Tasks

1. implement SQL tables and enums in `Supabase`
2. add SQL/RPC functions for geo queries
3. create repository/service layer
4. create route handlers
5. add validation with `zod`

### Result

The frontend can request real entities from the local backend.

## Phase 3. Dashboard and Onboarding

### Tasks

1. connect onboarding form to backend
2. persist preferences
3. build `next action` API
4. render recommended place and explanation
5. render nearby places from DB

### Result

The main product value is visible in the dashboard.

## Phase 4. Safety Module

### Tasks

1. create risk lookup API
2. connect safety screen to real data
3. add area/place safety search
4. display reasons and risk score

### Result

The safety scenario works end-to-end.

## Phase 5. Map and Navigation

### Tasks

1. integrate `MapLibre`
2. show current position or demo coordinates
3. render nearby place markers
4. load visible places through `PostGIS` bounding-box query
5. connect route API
6. show step-by-step navigation

### Result

Map and route screens become functional.

## Phase 6. Trip Recovery

### Tasks

1. create event model usage
2. trigger `rebuild` endpoint
3. compare old vs new plan
4. show changed items clearly

### Result

The differentiation scenario of the product is working.

## Phase 7. Settings and Polishing

### Tasks

1. display stored profile and preferences
2. allow preference updates
3. unify visual language
4. improve empty states and loading states

### Result

The application feels coherent as an MVP.

## 11. Order of Implementation in This Repository

Recommended order for this exact project:

1. fix encoding and text issues in wireframe screens
2. connect `Supabase` project
3. enable `PostGIS`
4. create `docs/` and `supabase/sql/`
5. create schema and seed
6. build API routes
7. connect onboarding
8. connect dashboard
9. connect safety
10. connect trip recovery
11. connect map and navigation
12. polish settings and shared state
13. deploy to `Vercel`

## 12. Suggested Folder Structure

```text
app/
  api/
    context/
    onboarding/
    places/
    recommendations/
    safety/
    trip-plan/
components/
  travel/
  ui/
features/
  onboarding/
  dashboard/
  safety/
  recovery/
  map/
lib/
  db/
  services/
  scoring/
  mocks/
supabase/
  sql/
    001_extensions.sql
    002_schema.sql
    003_geo_functions.sql
    004_seed.sql
docs/
  mvp-implementation-plan.md
```

## 13. Risks and Simplifications

### Main project risks

1. too many integrations too early
2. trying to build "real AI" before core product logic works
3. implementing all entities from the architecture at once
4. spending too much time on auth/admin instead of user flows

### Simplifications that are acceptable for MVP

1. one demo user
2. seeded places instead of full live catalog
3. deterministic recommendations
4. mocked event creation
5. static or semi-static safety data
6. route calls only for selected destination
7. geo queries implemented through a small set of SQL functions in `Supabase`

## 14. Acceptance Criteria for MVP

The MVP can be considered complete when:

1. onboarding saves preferences
2. dashboard shows one main recommendation from real app data
3. nearby places are loaded dynamically
4. safety screen shows place/area risk from stored data
5. trip recovery rebuilds a plan after an event
6. map screen renders markers from geo queries
7. navigation screen shows route steps
8. settings screen displays saved user data

## 15. Nice-to-Have After MVP

1. local `Ollama` explanation generation
2. saved favorite places
3. offline cache
4. activity history
5. moderator tools for places and risks

## 16. Concrete Next Step

The next useful implementation step after this document:

1. create `Supabase` project and enable `PostGIS`
2. define enums for:
   - `BudgetLevel`
   - `PreferenceMode`
   - `RiskLevel`
   - `TripStatus`
   - `PlanStatus`
   - `EventType`
   - `ActionType`
3. create SQL schema in `Supabase`
4. add seed data for:
   - one demo user
   - one active trip plan
   - 15-20 places
   - place risks
   - 3-5 risk zones
   - 2-3 events
   - 5-8 recommendations

## 17. Free Services References

- Supabase: `https://supabase.com/docs/guides/platform/billing-on-supabase`
- Supabase Database: `https://supabase.com/docs/guides/database/overview`
- Supabase PostGIS: `https://supabase.com/docs/guides/database/extensions/postgis`
- Vercel Hobby: `https://vercel.com/docs/accounts/plans/hobby`
- Next.js on Vercel: `https://vercel.com/docs/concepts/next.js/overview`
- MapLibre: `https://maplibre.org/projects/gl-js/`
- openrouteservice: `https://staging.openrouteservice.org/plans/`
- Open-Meteo: `https://open-meteo.com/`
- Ollama pricing: `https://ollama.com/pricing`
- Ollama FAQ: `https://docs.ollama.com/faq`
