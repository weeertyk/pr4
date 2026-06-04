import { DEMO_CITY_CENTER } from "@/lib/travel/demo"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { scoreRecommendationCandidates } from "@/lib/travel/scoring"
import type {
  EventRow,
  NearbyPlaceRow,
  PlaceRecord,
  PlaceRiskRow,
  PlanItemRow,
  PlanRow,
  RecommendationCandidate,
  RiskZoneRow,
  TodayPlanResponse,
  UserContextRecord,
  UserPreferencesRecord,
  UserProfileRecord,
} from "@/lib/travel/types"

function parseReasons(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  return []
}

function ensureData<T>(data: T | null, error: { message: string } | null) {
  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function upsertUserPreferences(input: {
  userId: string
  budgetLevel: string
  preferenceMode: string
  travelStyles: string[]
  language: string
  cityMode: boolean
}) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: input.userId,
        budget_level: input.budgetLevel,
        preference_mode: input.preferenceMode,
        travel_styles: input.travelStyles,
        language: input.language,
        city_mode: input.cityMode,
      },
      {
        onConflict: "user_id",
      },
    )
    .select("user_id, budget_level, preference_mode, travel_styles, language, city_mode")
    .single()

  return ensureData(data, error) as UserPreferencesRecord
}

export async function upsertUserProfile(input: {
  id: string
  email: string
  name?: string | null
}) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
      },
      {
        onConflict: "id",
      },
    )
    .select("id, email, name, role, is_premium")
    .single()

  return ensureData(data, error) as UserProfileRecord
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, is_premium")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as UserProfileRecord | null) ?? null
}

export async function getUserPreferences(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("user_preferences")
    .select("user_id, budget_level, preference_mode, travel_styles, language, city_mode")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as UserPreferencesRecord | null) ?? null
}

export async function getLatestUserContext(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("user_context")
    .select("id, user_id, current_time:recorded_at, trip_status, weather_code, city, country, source")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserContextRecord | null
}

export async function setUserContext(input: {
  userId: string
  lat: number
  lng: number
  city?: string
  country?: string
  weatherCode?: number
  source?: string
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("set_user_context", {
    in_user_id: input.userId,
    in_lat: input.lat,
    in_lng: input.lng,
    in_city: input.city ?? null,
    in_country: input.country ?? null,
    in_weather_code: input.weatherCode ?? null,
    in_source: input.source ?? "device",
  })

  const row = ensureData(data, error)?.[0] ?? null

  if (!row) {
    return null
  }

  return {
    ...row,
    current_time: row.recorded_at,
  } as UserContextRecord
}

export async function getNearbyPlaces(input: { lat?: number; lng?: number; limit?: number }) {
  const supabase = getSupabaseAdmin()
  const lat = input.lat ?? DEMO_CITY_CENTER.lat
  const lng = input.lng ?? DEMO_CITY_CENTER.lng
  const limit = input.limit ?? 8

  const { data, error } = await supabase.rpc("places_nearby", {
    in_lat: lat,
    in_lng: lng,
    in_limit: limit,
  })

  return ensureData(data, error) as NearbyPlaceRow[]
}

export async function getPlacesInBounds(input: {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("places_in_bounds", {
    min_lat: input.minLat,
    min_lng: input.minLng,
    max_lat: input.maxLat,
    max_lng: input.maxLng,
  })

  return ensureData(data, error)
}

export async function getPlaceRisk(placeId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("place_risks")
    .select("place_id, risk_level, risk_score, reasons")
    .eq("place_id", placeId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return {
    ...data,
    reasons: parseReasons(data.reasons),
  } as PlaceRiskRow
}

export async function getPlaceRisks(placeIds: string[]) {
  if (placeIds.length === 0) {
    return []
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("place_risks")
    .select("place_id, risk_level, risk_score, reasons")
    .in("place_id", placeIds)

  const rows = ensureData(data, error) ?? []

  return rows.map(
    (row: any) =>
      ({
        ...row,
        reasons: parseReasons(row.reasons),
      }) as PlaceRiskRow,
  )
}

export async function getRiskZoneForPoint(lat: number, lng: number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("risk_zone_for_point", {
    in_lat: lat,
    in_lng: lng,
  })

  const zone = ensureData(data, error)?.[0] ?? null

  if (!zone) {
    return null
  }

  return {
    ...zone,
    reasons: parseReasons(zone.reasons),
  } as RiskZoneRow
}

export async function getTodayPlan(userId: string) {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const { data: planData, error: planError } = await supabase
    .from("trip_plans")
    .select("id, user_id, date, status, title")
    .eq("user_id", userId)
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (planError) {
    throw new Error(planError.message)
  }

  if (!planData) {
    return null
  }

  const plan = planData as PlanRow

  const { data: itemData, error: itemError } = await supabase
    .from("trip_plan_items")
    .select("id, trip_plan_id, place_id, start_time, end_time, position, status, note")
    .eq("trip_plan_id", plan.id)
    .order("position", { ascending: true })

  const items = ensureData(itemData, itemError) as PlanItemRow[]
  const placeIds = items.map((item) => item.place_id)

  let placesById = new Map<string, PlaceRecord>()

  if (placeIds.length > 0) {
    const { data: placeData, error: placeError } = await supabase
      .from("places")
      .select("id, name, category, price_level, rating, is_open, description")
      .in("id", placeIds)

    const places = ensureData(placeData, placeError) as PlaceRecord[]
    placesById = new Map(places.map((place) => [place.id, place]))
  }

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id, trip_plan_id, type, severity, description, related_place_id, timestamp:occurred_at")
    .eq("trip_plan_id", plan.id)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (eventError) {
    throw new Error(eventError.message)
  }

  return {
    plan,
    items: items.map((item) => ({
      ...item,
      place: placesById.get(item.place_id) ?? null,
    })),
    latestEvent: (eventData as EventRow | null) ?? null,
  } satisfies TodayPlanResponse
}

export async function getNextRecommendation(input: {
  userId: string
  lat?: number
  lng?: number
  limit?: number
}) {
  const [preferences, context, nearbyPlaces] = await Promise.all([
    getUserPreferences(input.userId),
    getLatestUserContext(input.userId),
    getNearbyPlaces({
      lat: input.lat,
      lng: input.lng,
      limit: input.limit ?? 8,
    }),
  ])

  if (!preferences) {
    return {
      context,
      preferences: null,
      recommendation: null,
      alternatives: [],
    }
  }

  const risks = await getPlaceRisks(nearbyPlaces.map((place) => place.id))
  const ranked = scoreRecommendationCandidates({
    places: nearbyPlaces,
    preferences,
    context,
    risks,
  })

  return {
    context,
    preferences,
    recommendation: ranked[0] ?? null,
    alternatives: ranked.slice(1, 4),
  }
}

export async function rebuildTodayPlan(input: {
  userId: string
  lat?: number
  lng?: number
  event?: {
    type: string
    severity?: string
    description?: string
    relatedPlaceId?: string
  }
}) {
  const [todayPlan, recommendationData] = await Promise.all([
    getTodayPlan(input.userId),
    getNextRecommendation({
      userId: input.userId,
      lat: input.lat,
      lng: input.lng,
      limit: 10,
    }),
  ])

  if (!todayPlan) {
    return null
  }

  const latestEvent = input.event
    ? {
        ...input.event,
        description: input.event.description ?? "План поездки обновлён из-за нового события.",
      }
    : todayPlan.latestEvent

  const blockedPlaceId = (latestEvent as any)?.relatedPlaceId ?? todayPlan.latestEvent?.related_place_id ?? null
  const alternatives = recommendationData.alternatives.filter((item) => item.id !== blockedPlaceId)
  const replacement = alternatives[0] ?? recommendationData.recommendation

  const changedItemIndex = blockedPlaceId
    ? todayPlan.items.findIndex((item) => item.place_id === blockedPlaceId)
    : 0

  const safeIndex = changedItemIndex >= 0 ? changedItemIndex : 0

  const newItems = todayPlan.items.map((item, index) => {
    if (index !== safeIndex || !replacement) {
      return {
        ...item,
        changed: false,
      }
    }

    return {
      ...item,
      place_id: replacement.id,
      place: {
        id: replacement.id,
        name: replacement.name,
        category: replacement.category,
        price_level: replacement.priceLevel,
        rating: replacement.rating,
        is_open: replacement.isOpen,
        description: replacement.reason,
      },
      note: replacement.reason,
      status: "REPLACED" as const,
      changed: true,
    }
  })

  return {
    plan: todayPlan.plan,
    event: latestEvent,
    oldItems: todayPlan.items,
    newItems,
    replacement,
  }
}
