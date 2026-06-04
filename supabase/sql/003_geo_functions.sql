create or replace function public.places_nearby(
  in_lat double precision,
  in_lng double precision,
  in_limit integer default 10
)
returns table (
  id uuid,
  name text,
  category public.place_category,
  price_level public.budget_level,
  rating numeric,
  is_open boolean,
  description text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.category,
    p.price_level,
    p.rating,
    p.is_open,
    p.description,
    extensions.st_y(p.location::extensions.geometry) as latitude,
    extensions.st_x(p.location::extensions.geometry) as longitude,
    extensions.st_distance(
      p.location,
      extensions.st_setsrid(extensions.st_makepoint(in_lng, in_lat), 4326)::extensions.geography
    ) as distance_meters
  from public.places p
  order by p.location operator(extensions.<->) extensions.st_setsrid(
    extensions.st_makepoint(in_lng, in_lat),
    4326
  )::extensions.geography
  limit in_limit;
$$;

create or replace function public.places_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision
)
returns table (
  id uuid,
  name text,
  category public.place_category,
  latitude double precision,
  longitude double precision
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.category,
    extensions.st_y(p.location::extensions.geometry) as latitude,
    extensions.st_x(p.location::extensions.geometry) as longitude
  from public.places p
  where p.location::extensions.geometry operator(extensions.&&)
    extensions.st_setsrid(
      extensions.st_makebox2d(
        extensions.st_makepoint(min_lng, min_lat),
        extensions.st_makepoint(max_lng, max_lat)
      ),
      4326
    );
$$;

create or replace function public.risk_zone_for_point(
  in_lat double precision,
  in_lng double precision
)
returns table (
  id uuid,
  name text,
  city text,
  risk_level public.risk_level,
  risk_score int,
  reasons jsonb
)
language sql
stable
as $$
  select
    rz.id,
    rz.name,
    rz.city,
    rz.risk_level,
    rz.risk_score,
    rz.reasons
  from public.risk_zones rz
  where extensions.st_contains(
    rz.area,
    extensions.st_setsrid(extensions.st_makepoint(in_lng, in_lat), 4326)
  )
  order by rz.risk_score desc
  limit 1;
$$;

create or replace function public.set_user_context(
  in_user_id uuid,
  in_lat double precision,
  in_lng double precision,
  in_city text default null,
  in_country text default null,
  in_weather_code integer default null,
  in_source text default 'device'
)
returns table (
  id uuid,
  user_id uuid,
  recorded_at timestamptz,
  trip_status public.trip_status,
  weather_code integer,
  city text,
  country text,
  source text
)
language sql
volatile
as $$
  insert into public.user_context (
    user_id,
    location,
    recorded_at,
    trip_status,
    weather_code,
    city,
    country,
    source
  )
  values (
    in_user_id,
    extensions.st_setsrid(extensions.st_makepoint(in_lng, in_lat), 4326)::extensions.geography,
    now(),
    'ACTIVE',
    in_weather_code,
    in_city,
    in_country,
    in_source
  )
  returning
    user_context.id,
    user_context.user_id,
    user_context.recorded_at,
    user_context.trip_status,
    user_context.weather_code,
    user_context.city,
    user_context.country,
    user_context.source;
$$;

create or replace function public.get_users_near_place(
  in_place_id uuid,
  in_distance_meters double precision default 1000.0
)
returns table (
  user_id uuid,
  email text,
  distance_meters double precision
)
language sql
stable
as $$
  with latest_context as (
    select distinct on (user_id)
      user_id,
      location,
      updated_at
    from public.user_context
    order by user_id, updated_at desc
  ),
  place_loc as (
    select location from public.places where id = in_place_id
  )
  select
    lc.user_id,
    u.email,
    extensions.st_distance(lc.location, pl.location) as distance_meters
  from latest_context lc
  join public.users u on u.id = lc.user_id
  cross join place_loc pl
  where extensions.st_distance(lc.location, pl.location) <= in_distance_meters;
$$;
