create type public.app_role as enum ('USER', 'MODERATOR', 'ADMIN');
create type public.budget_level as enum ('ECONOMY', 'BALANCED', 'PREMIUM');
create type public.preference_mode as enum ('EFFICIENCY', 'SAFETY', 'EXPLORATION');
create type public.trip_status as enum ('ACTIVE', 'PAUSED', 'DISRUPTED', 'COMPLETED');
create type public.plan_status as enum ('DRAFT', 'ACTIVE', 'REBUILT', 'COMPLETED', 'CANCELLED');
create type public.plan_item_status as enum ('PLANNED', 'IN_PROGRESS', 'DONE', 'SKIPPED', 'REPLACED');
create type public.risk_level as enum ('SAFE', 'CAUTION', 'AVOID');
create type public.event_type as enum ('WEATHER', 'PLACE_CLOSED', 'DELAY', 'USER_CHANGE', 'TRANSPORT_ISSUE');
create type public.event_severity as enum ('LOW', 'MEDIUM', 'HIGH');
create type public.action_type as enum ('VISIT', 'EAT', 'REST', 'REROUTE', 'WAIT', 'SHELTER');
create type public.place_category as enum ('CAFE', 'RESTAURANT', 'MUSEUM', 'PARK', 'VIEWPOINT', 'TRANSPORT', 'SHOP', 'HOTEL', 'LANDMARK');

create table if not exists public.users (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique,
  name text,
  role public.app_role not null default 'USER',
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  budget_level public.budget_level not null,
  preference_mode public.preference_mode not null,
  travel_styles text[] not null default '{}',
  language text not null default 'ru',
  city_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_context (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  location extensions.geography(point, 4326) not null,
  recorded_at timestamptz not null default now(),
  trip_status public.trip_status not null default 'ACTIVE',
  weather_code int,
  city text,
  country text,
  source text default 'device',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  category public.place_category not null,
  location extensions.geography(point, 4326) not null,
  price_level public.budget_level,
  rating numeric(3,2),
  is_open boolean,
  description text,
  source text default 'seed',
  external_place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_risks (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null unique references public.places(id) on delete cascade,
  risk_level public.risk_level not null,
  risk_score int not null check (risk_score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.risk_zones (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  city text not null,
  risk_level public.risk_level not null,
  risk_score int not null check (risk_score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  area extensions.geometry(polygon, 4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  status public.plan_status not null default 'DRAFT',
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_plan_items (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  position int not null,
  status public.plan_item_status not null default 'PLANNED',
  note text,
  unique(trip_plan_id, position)
);

create table if not exists public.events (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  type public.event_type not null,
  severity public.event_severity not null default 'MEDIUM',
  description text,
  related_place_id uuid references public.places(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  context_id uuid references public.user_context(id) on delete set null,
  place_id uuid not null references public.places(id) on delete cascade,
  action_type public.action_type not null,
  reason text not null,
  score numeric(5,2) not null,
  context_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_context_user_updated_at
  on public.user_context (user_id, updated_at desc);

create index if not exists idx_recommendations_user_created_at
  on public.recommendations (user_id, created_at desc);

create index if not exists idx_places_location
  on public.places using gist (location);

create index if not exists idx_user_context_location
  on public.user_context using gist (location);

create index if not exists idx_risk_zones_area
  on public.risk_zones using gist (area);

alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_context enable row level security;
alter table public.places enable row level security;
alter table public.place_risks enable row level security;
alter table public.risk_zones enable row level security;
alter table public.trip_plans enable row level security;
alter table public.trip_plan_items enable row level security;
alter table public.events enable row level security;
alter table public.recommendations enable row level security;

create policy "users can read own profile"
on public.users
for select
using (auth.uid() = id);

create policy "users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "users can read own preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

create policy "users can insert own preferences"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

create policy "users can update own preferences"
on public.user_preferences
for update
using (auth.uid() = user_id);

create policy "users can read own context"
on public.user_context
for select
using (auth.uid() = user_id);

create policy "users can insert own context"
on public.user_context
for insert
with check (auth.uid() = user_id);

create policy "users can update own context"
on public.user_context
for update
using (auth.uid() = user_id);

create policy "authenticated users can read places"
on public.places
for select
to authenticated
using (true);

create policy "authenticated users can read place risks"
on public.place_risks
for select
to authenticated
using (true);

create policy "authenticated users can read risk zones"
on public.risk_zones
for select
to authenticated
using (true);

create policy "users can read own plans"
on public.trip_plans
for select
using (auth.uid() = user_id);

create policy "users can manage own plans"
on public.trip_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can read plan items from own plans"
on public.trip_plan_items
for select
using (
  exists (
    select 1
    from public.trip_plans tp
    where tp.id = trip_plan_id and tp.user_id = auth.uid()
  )
);

create policy "users can manage plan items from own plans"
on public.trip_plan_items
for all
using (
  exists (
    select 1
    from public.trip_plans tp
    where tp.id = trip_plan_id and tp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trip_plans tp
    where tp.id = trip_plan_id and tp.user_id = auth.uid()
  )
);

create policy "users can read own recommendations"
on public.recommendations
for select
using (auth.uid() = user_id);

create policy "users can read events from own plans"
on public.events
for select
using (
  exists (
    select 1
    from public.trip_plans tp
    where tp.id = trip_plan_id and tp.user_id = auth.uid()
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

create trigger set_user_context_updated_at
before update on public.user_context
for each row
execute function public.set_updated_at();

create trigger set_places_updated_at
before update on public.places
for each row
execute function public.set_updated_at();

create trigger set_place_risks_updated_at
before update on public.place_risks
for each row
execute function public.set_updated_at();

create trigger set_risk_zones_updated_at
before update on public.risk_zones
for each row
execute function public.set_updated_at();

create trigger set_trip_plans_updated_at
before update on public.trip_plans
for each row
execute function public.set_updated_at();
