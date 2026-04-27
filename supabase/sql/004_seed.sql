insert into public.users (id, email, name, role, is_premium)
values
  ('11111111-1111-1111-1111-111111111111', 'demo@travel.ai', 'Demo Traveler', 'USER', false),
  ('11111111-1111-1111-1111-111111111112', 'citywalker@travel.ai', 'City Walker', 'USER', false),
  ('11111111-1111-1111-1111-111111111113', 'safetrip@travel.ai', 'Safe Trip', 'USER', false)
on conflict (id) do nothing;

insert into public.user_preferences (id, user_id, budget_level, preference_mode, travel_styles, language, city_mode)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BALANCED', 'SAFETY', '{"EXPLORATION","FOOD","INDOOR"}', 'ru', true),
  ('21111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111112', 'ECONOMY', 'EXPLORATION', '{"EXPLORATION","LANDMARKS","WALKING"}', 'ru', true),
  ('21111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111113', 'PREMIUM', 'SAFETY', '{"SAFETY","INDOOR","COMFORT"}', 'ru', true)
on conflict (user_id) do nothing;

insert into public.user_context (id, user_id, location, recorded_at, trip_status, weather_code, city, country, source)
values
  (
    '31111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    extensions.st_setsrid(extensions.st_makepoint(37.6208, 55.7539), 4326)::extensions.geography,
    now(),
    'ACTIVE',
    61,
    'Moscow',
    'Russia',
    'seed'
  ),
  (
    '31111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111112',
    extensions.st_setsrid(extensions.st_makepoint(37.6240, 55.7583), 4326)::extensions.geography,
    now(),
    'ACTIVE',
    1,
    'Moscow',
    'Russia',
    'seed'
  ),
  (
    '31111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111113',
    extensions.st_setsrid(extensions.st_makepoint(37.6054, 55.7446), 4326)::extensions.geography,
    now(),
    'ACTIVE',
    63,
    'Moscow',
    'Russia',
    'seed'
  )
on conflict (id) do nothing;

insert into public.places (id, name, category, location, price_level, rating, is_open, description, source)
values
  ('41111111-1111-1111-1111-111111111111', 'Double B Coffee', 'CAFE', extensions.st_setsrid(extensions.st_makepoint(37.6189, 55.7548), 4326)::extensions.geography, 'BALANCED', 4.70, true, 'Indoor coffee spot near the center.', 'seed'),
  ('41111111-1111-1111-1111-111111111112', 'GUM Food Hall', 'RESTAURANT', extensions.st_setsrid(extensions.st_makepoint(37.6216, 55.7545), 4326)::extensions.geography, 'BALANCED', 4.60, true, 'Food hall with many options.', 'seed'),
  ('41111111-1111-1111-1111-111111111113', 'Zaryadye Park', 'PARK', extensions.st_setsrid(extensions.st_makepoint(37.6281, 55.7510), 4326)::extensions.geography, 'ECONOMY', 4.80, true, 'Open-air city park with scenic views.', 'seed'),
  ('41111111-1111-1111-1111-111111111114', 'State Historical Museum', 'MUSEUM', extensions.st_setsrid(extensions.st_makepoint(37.6177, 55.7554), 4326)::extensions.geography, 'BALANCED', 4.80, false, 'Museum currently closed for a private event.', 'seed'),
  ('41111111-1111-1111-1111-111111111115', 'Patriarch Bridge Viewpoint', 'VIEWPOINT', extensions.st_setsrid(extensions.st_makepoint(37.6054, 55.7446), 4326)::extensions.geography, 'ECONOMY', 4.70, true, 'Popular photo spot with river view.', 'seed'),
  ('41111111-1111-1111-1111-111111111116', 'Tretyakov Gallery', 'MUSEUM', extensions.st_setsrid(extensions.st_makepoint(37.6206, 55.7414), 4326)::extensions.geography, 'PREMIUM', 4.90, true, 'Large indoor museum.', 'seed'),
  ('41111111-1111-1111-1111-111111111117', 'Kuznetsky Most Station', 'TRANSPORT', extensions.st_setsrid(extensions.st_makepoint(37.6244, 55.7607), 4326)::extensions.geography, null, 4.20, true, 'Metro station.', 'seed'),
  ('41111111-1111-1111-1111-111111111118', 'Nikolskaya Street Landmark', 'LANDMARK', extensions.st_setsrid(extensions.st_makepoint(37.6229, 55.7580), 4326)::extensions.geography, 'ECONOMY', 4.60, true, 'Busy tourist street.', 'seed')
on conflict (id) do nothing;

insert into public.place_risks (id, place_id, risk_level, risk_score, reasons)
values
  ('51111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'SAFE', 92, '["Well-lit area", "High foot traffic", "Indoor location"]'::jsonb),
  ('51111111-1111-1111-1111-111111111112', '41111111-1111-1111-1111-111111111112', 'SAFE', 88, '["Central location", "Crowded during daytime"]'::jsonb),
  ('51111111-1111-1111-1111-111111111113', '41111111-1111-1111-1111-111111111113', 'SAFE', 84, '["Open public area", "Some weather exposure"]'::jsonb),
  ('51111111-1111-1111-1111-111111111114', '41111111-1111-1111-1111-111111111114', 'CAUTION', 55, '["Currently closed", "Trip disruption risk"]'::jsonb),
  ('51111111-1111-1111-1111-111111111115', '41111111-1111-1111-1111-111111111115', 'SAFE', 78, '["Open viewpoint", "More isolated in late evening"]'::jsonb),
  ('51111111-1111-1111-1111-111111111116', '41111111-1111-1111-1111-111111111116', 'SAFE', 90, '["Indoor", "High rating", "Popular destination"]'::jsonb),
  ('51111111-1111-1111-1111-111111111117', '41111111-1111-1111-1111-111111111117', 'SAFE', 81, '["Official transport hub"]'::jsonb),
  ('51111111-1111-1111-1111-111111111118', '41111111-1111-1111-1111-111111111118', 'CAUTION', 64, '["Very crowded area", "Common tourist overpricing nearby"]'::jsonb)
on conflict (place_id) do nothing;

insert into public.risk_zones (id, name, city, risk_level, risk_score, reasons, area)
values
  (
    '61111111-1111-1111-1111-111111111111',
    'Central Tourist Flow',
    'Moscow',
    'CAUTION',
    62,
    '["Pickpocket risk during peak hours", "Crowded tourist area"]'::jsonb,
    extensions.st_geomfromtext('POLYGON((37.6200 55.7565, 37.6245 55.7565, 37.6245 55.7588, 37.6200 55.7588, 37.6200 55.7565))', 4326)
  ),
  (
    '61111111-1111-1111-1111-111111111112',
    'Riverside Evening Zone',
    'Moscow',
    'SAFE',
    80,
    '["Popular walking route", "Moderate evening activity"]'::jsonb,
    extensions.st_geomfromtext('POLYGON((37.6030 55.7435, 37.6078 55.7435, 37.6078 55.7465, 37.6030 55.7465, 37.6030 55.7435))', 4326)
  )
on conflict (id) do nothing;

insert into public.trip_plans (id, user_id, date, status, title)
values
  ('71111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', current_date, 'ACTIVE', 'Moscow city day')
on conflict (id) do nothing;

insert into public.trip_plan_items (id, trip_plan_id, place_id, start_time, end_time, position, status, note)
values
  ('81111111-1111-1111-1111-111111111111', '71111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111114', now() + interval '30 minutes', now() + interval '2 hours', 1, 'PLANNED', 'Original museum stop'),
  ('81111111-1111-1111-1111-111111111112', '71111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111112', now() + interval '2 hours 30 minutes', now() + interval '3 hours 30 minutes', 2, 'PLANNED', 'Lunch stop'),
  ('81111111-1111-1111-1111-111111111113', '71111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111115', now() + interval '4 hours', now() + interval '5 hours', 3, 'PLANNED', 'Scenic walk')
on conflict (id) do nothing;

insert into public.events (id, trip_plan_id, type, severity, description, related_place_id, occurred_at)
values
  ('91111111-1111-1111-1111-111111111111', '71111111-1111-1111-1111-111111111111', 'PLACE_CLOSED', 'HIGH', 'Museum closed today due to a private event.', '41111111-1111-1111-1111-111111111114', now())
on conflict (id) do nothing;

insert into public.recommendations (id, user_id, context_id, place_id, action_type, reason, score, context_snapshot)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '31111111-1111-1111-1111-111111111111',
    '41111111-1111-1111-1111-111111111111',
    'EAT',
    'Rain is expected soon, this nearby indoor cafe fits your balanced budget and strong safety preference.',
    92.50,
    '{"weather":"rain_soon","budget":"BALANCED","mode":"SAFETY"}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    '31111111-1111-1111-1111-111111111111',
    '41111111-1111-1111-1111-111111111116',
    'VISIT',
    'Indoor museum with strong ratings and low risk works well as a recovery option.',
    88.40,
    '{"weather":"rain_soon","budget":"BALANCED","mode":"SAFETY"}'::jsonb
  )
on conflict (id) do nothing;
