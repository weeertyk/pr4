import type {
  ActionType,
  BudgetLevel,
  EventSeverity,
  EventType,
  PlaceCategory,
  PlanItemStatus,
  PlanStatus,
  PreferenceMode,
  RiskLevel,
  TripStatus,
} from "@/lib/travel/domain"

export type UserPreferencesRecord = {
  user_id: string
  budget_level: BudgetLevel
  preference_mode: PreferenceMode
  travel_styles: string[]
  language: string
  city_mode: boolean
}

export type UserProfileRecord = {
  id: string
  email: string
  name: string | null
  role: string
  is_premium: boolean
}

export type UserContextRecord = {
  id: string
  user_id: string
  current_time: string
  trip_status: TripStatus
  weather_code: number | null
  city: string | null
  country: string | null
  source: string | null
}

export type NearbyPlaceRow = {
  id: string
  name: string
  category: PlaceCategory
  price_level: BudgetLevel | null
  rating: number | null
  is_open: boolean | null
  description: string | null
  latitude: number
  longitude: number
  distance_meters: number
}

export type PlaceRiskRow = {
  place_id: string
  risk_level: RiskLevel
  risk_score: number
  reasons: string[]
}

export type RiskZoneRow = {
  id: string
  name: string
  city: string
  risk_level: RiskLevel
  risk_score: number
  reasons: string[]
}

export type PlanRow = {
  id: string
  user_id: string
  date: string
  status: PlanStatus
  title: string | null
}

export type PlanItemRow = {
  id: string
  trip_plan_id: string
  place_id: string
  start_time: string
  end_time: string
  position: number
  status: PlanItemStatus
  note: string | null
}

export type EventRow = {
  id: string
  trip_plan_id: string
  type: EventType
  severity: EventSeverity
  description: string | null
  related_place_id: string | null
  timestamp: string
}

export type PlaceRecord = {
  id: string
  name: string
  category: PlaceCategory
  price_level: BudgetLevel | null
  rating: number | null
  is_open: boolean | null
  description: string | null
}

export type RecommendationCandidate = {
  id: string
  name: string
  category: PlaceCategory
  actionType: ActionType
  reason: string
  score: number
  distanceMeters: number
  latitude: number
  longitude: number
  riskLevel: RiskLevel
  riskScore: number
  priceLevel: BudgetLevel | null
  rating: number | null
  isOpen: boolean | null
}

export type TodayPlanResponse = {
  plan: PlanRow
  items: Array<
    PlanItemRow & {
      place: PlaceRecord | null
    }
  >
  latestEvent: EventRow | null
}
