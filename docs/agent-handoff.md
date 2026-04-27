# AI Agent Handoff: AI Travel Companion MVP

## 1. What this project is

This repository contains the implementation of a coursework MVP for `AI Travel Companion`.

The user is building a `web MVP` of the product described in:

- `D:\ISIS\nik\pr3.docx`
- prior wireframes already present in this project
- the practical assignment for `Code-First AI-assisted` path

The product is not a generic travel guide. Its core idea is:

1. understand traveler context in real time
2. suggest the best next action
3. rebuild the day when the plan breaks
4. help the traveler avoid risky places or areas

This is a `coursework MVP`, so the goal is not a huge production system, but a coherent working demo that reflects:

- user scenarios
- architecture from the earlier practice
- entity model
- UI flows from the wireframes

## 2. What the user needs for this practical work

The user needs to implement the MVP web application, not just describe it.

From the conversation, the practical goal is understood like this:

1. take the previously designed product concept and architecture
2. turn it into a working web MVP
3. keep the stack free
4. stay close to the existing wireframes
5. reflect the core product logic in the interface and backend

The user explicitly chose these technical directions:

- database: `Supabase`
- deploy: `Vercel`
- geospatial support: `PostGIS` if needed

The project was intentionally simplified to a `Supabase-first` architecture without Prisma.

## 3. Final architecture decisions already made

Do not re-introduce Prisma unless the user asks for it.

Chosen stack:

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `Supabase Postgres`
- `Supabase Auth`
- `Supabase Storage`
- `PostGIS`
- `supabase-js`
- `MapLibre GL JS`
- `OpenRouteService`
- `Open-Meteo`
- `Vercel`

Important architecture rule:

- relational and geo schema live in `Supabase SQL`
- app data access goes through `supabase-js`
- geo queries go through `Supabase RPC / SQL functions`

## 4. Main MVP scenarios

These are the three most important product scenarios and should stay the product center:

1. `Best Next Action`
   - dashboard suggests the next useful move for the traveler

2. `Trip Recovery`
   - if a place is closed or the situation changes, the plan is rebuilt

3. `Safety Scanner`
   - the user can assess risk for a place or area

Additional support scenarios:

- onboarding with traveler preferences
- map with visible places
- navigation to a selected place
- settings and preference editing

## 5. Data model currently expected

Core tables:

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

Key geo fields:

- `user_context.location`
- `places.location`
- `risk_zones.area`

The database is already represented in SQL files under `supabase/sql/`.

## 6. Current project structure

Important folders and files:

```text
app/
  api/
    context/
    onboarding/
    places/
    recommendations/
    routes/
    safety/
    trip-plan/
  layout.tsx
  page.tsx
  globals.css

components/
  travel/
    maplibre-map.tsx
  wireframe/
    bottom-nav.tsx
    image-placeholder.tsx
    screens/
      dashboard-screen.tsx
      map-screen.tsx
      navigation-screen.tsx
      onboarding-screen.tsx
      safety-screen.tsx
      settings-screen.tsx
      trip-recovery-screen.tsx

lib/
  env.ts
  supabase/
    admin.ts
  travel/
    demo.ts
    domain.ts
    schemas.ts
    scoring.ts
    service.ts
    types.ts
    ui-types.ts

supabase/
  sql/
    001_extensions.sql
    002_schema.sql
    003_geo_functions.sql
    004_seed.sql

docs/
  mvp-implementation-plan.md
  supabase-setup.md
  agent-handoff.md
```

## 7. What has already been implemented

### Data and backend

- `Supabase SQL` schema
- `PostGIS` extension setup
- geo RPC functions:
  - `places_nearby`
  - `places_in_bounds`
  - `risk_zone_for_point`
  - `set_user_context`
- seed data for demo user, places, risks, zones, plans, events, recommendations
- server-side env validation
- Supabase admin client
- domain scoring logic for recommendations

### API routes

Already present:

- `GET /api/context`
- `POST /api/context`
- `POST /api/onboarding`
- `GET /api/places/nearby`
- `GET /api/places/in-bounds`
- `GET /api/places/[id]/risk`
- `GET /api/safety/area`
- `GET /api/recommendations/next`
- `POST /api/recommendations/rebuild`
- `GET /api/trip-plan/today`
- `GET /api/routes`

### Frontend flows already connected to data

- `DashboardScreen`
  - fetches recommendation
  - fetches nearby places
  - shows trip recovery notice

- `SafetyScreen`
  - fetches area safety

- `TripRecoveryScreen`
  - fetches rebuilt plan

- `MapScreen`
  - fetches places through map bounds API
  - displays real points
  - passes selected destination to navigation

- `NavigationScreen`
  - fetches route
  - displays route summary and steps
  - uses `MapLibre`

### Shared app flow

- `app/page.tsx` manages active screen
- selected destination is stored at page level and passed into navigation

### Build status

- `pnpm build` was run successfully after `MapLibre` integration

## 8. Important implementation notes

### 8.1 Supabase-first, no Prisma

Prisma was deliberately removed.

Keep these principles:

- do not add ORM back without explicit user request
- schema changes should be made in SQL files
- data access should stay aligned with `supabase-js`

### 8.2 Secrets

The user asked about limiting access to `.env.local`.

You should avoid reading secrets unless necessary.
Do not repeat secrets in messages.
If a secret is exposed by the user, treat it as compromised and recommend rotation.

### 8.3 Current local env expectation

The project now expects only:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTESERVICE_API_KEY=
```

### 8.4 Current visual state

Some files still contain text with broken encoding inherited from earlier wireframe generation.

This is a real cleanup task, not just cosmetic polish.

## 9. What is still missing or incomplete

The project is not finished yet.

Main missing areas:

1. `Onboarding`
   - UI exists
   - backend exists
   - screen is not fully wired to save preferences through API

2. `Settings`
   - UI exists
   - not fully wired to load/update real preferences and profile data

3. `Map UX`
   - real map is integrated
   - but there is still room for polish:
     - better marker styling
     - better current location behavior
     - route line polish

4. `Navigation UX`
   - route data works
   - fallback route works
   - voice/help controls are still placeholders

5. `Onboarding -> recommendation influence`
   - preferences are modeled and supported in backend
   - but the full user flow should be tested and completed

6. `Authentication`
   - `Supabase Auth` is part of target architecture
   - current MVP still behaves like a demo-user-driven prototype

7. `Encoding cleanup`
   - some old screens still contain mojibake-style Russian text

## 10. What the next agent should do first

Recommended priority order:

1. connect onboarding to `POST /api/onboarding`
2. connect settings to real `user_preferences` data
3. clean up text encoding issues in remaining screens
4. improve map and navigation UX around real route data
5. optionally introduce real `Supabase Auth` after core user flows are stable

If the user says "continue implementation", the best next target is:

- finish `onboarding + settings + preference persistence`

If the user says "prepare for demo", the best next target is:

- polish dashboard, map and navigation
- make Russian UI text clean and consistent

## 11. What not to waste time on

Avoid spending time on:

- reintroducing Prisma
- building CRM/BPMS/Telegram integration
- full admin panel
- full offline support
- complex AI/LLM orchestration
- premature refactors away from the current feature set

These are outside the MVP focus.

## 12. Short practical interpretation

This practical work is understood as:

"Take the already designed AI Travel Companion concept, entities, architecture and wireframes, and implement a real web MVP that demonstrates the core product value through working UI flows, free infrastructure, and a small but coherent backend."

That means the user does not need a giant production platform.
They need a convincing, working MVP tied to the earlier analysis and interface design.
