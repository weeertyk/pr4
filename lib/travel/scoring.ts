import type { ActionType, BudgetLevel, PlaceCategory, PreferenceMode, RiskLevel } from "@/lib/travel/domain"
import type { NearbyPlaceRow, PlaceRiskRow, RecommendationCandidate, UserContextRecord, UserPreferencesRecord } from "@/lib/travel/types"

const indoorCategories = new Set<PlaceCategory>(["CAFE", "RESTAURANT", "MUSEUM", "SHOP", "HOTEL"])

function isRainLikely(weatherCode: number | null | undefined) {
  if (weatherCode == null) {
    return false
  }

  return weatherCode >= 51 && weatherCode <= 99
}

function inferActionType(category: PlaceCategory): ActionType {
  switch (category) {
    case "CAFE":
    case "RESTAURANT":
      return "EAT"
    case "PARK":
    case "VIEWPOINT":
    case "LANDMARK":
      return "VISIT"
    case "TRANSPORT":
      return "REROUTE"
    case "HOTEL":
      return "REST"
    default:
      return "VISIT"
  }
}

function buildReason(params: {
  place: NearbyPlaceRow
  preferences: UserPreferencesRecord
  risk: PlaceRiskRow | undefined
  rainy: boolean
  distanceMeters: number
}) {
  const fragments: string[] = []

  if (params.distanceMeters <= 500) {
    fragments.push("it is nearby")
  }

  if (params.place.price_level && params.place.price_level === params.preferences.budget_level) {
    fragments.push("it matches your budget")
  }

  if (params.risk?.risk_level === "SAFE") {
    fragments.push("it has a strong safety score")
  }

  if (params.rainy && indoorCategories.has(params.place.category)) {
    fragments.push("it works well if the weather gets worse")
  }

  if (params.place.is_open) {
    fragments.push("it is open right now")
  }

  return fragments.length > 0
    ? `Recommended because ${fragments.join(", ")}.`
    : "Recommended as a reasonable next step for your current trip context."
}

function getDistanceScore(distanceMeters: number) {
  if (distanceMeters <= 150) return 32
  if (distanceMeters <= 350) return 28
  if (distanceMeters <= 600) return 22
  if (distanceMeters <= 1000) return 14
  return 6
}

function getBudgetScore(placeBudget: BudgetLevel | null, userBudget: BudgetLevel) {
  if (!placeBudget) return 8
  if (placeBudget === userBudget) return 16
  if (userBudget === "PREMIUM") return 10
  return 4
}

function getRiskScore(riskLevel: RiskLevel | undefined, riskScore: number | undefined) {
  if (!riskLevel || riskScore == null) return 10
  if (riskLevel === "SAFE") return 22 + riskScore / 20
  if (riskLevel === "CAUTION") return 8 + riskScore / 30
  return -20
}

function getWeatherScore(place: NearbyPlaceRow, rainy: boolean) {
  if (!rainy) return 8
  return indoorCategories.has(place.category) ? 16 : -4
}

function getPreferenceModeScore(place: NearbyPlaceRow, mode: PreferenceMode) {
  if (mode === "SAFETY") {
    return place.is_open === false ? -12 : 10
  }

  if (mode === "EFFICIENCY") {
    return place.distance_meters <= 400 ? 14 : 4
  }

  if (mode === "EXPLORATION") {
    return place.category === "LANDMARK" || place.category === "VIEWPOINT" || place.category === "PARK" ? 14 : 8
  }

  return 0
}

export function scoreRecommendationCandidates(params: {
  places: NearbyPlaceRow[]
  preferences: UserPreferencesRecord
  context: UserContextRecord | null
  risks: PlaceRiskRow[]
}) {
  const rainy = isRainLikely(params.context?.weather_code)
  const risksByPlaceId = new Map(params.risks.map((risk) => [risk.place_id, risk]))

  return params.places
    .map<RecommendationCandidate>((place) => {
      const risk = risksByPlaceId.get(place.id)

      let score = 0
      score += getDistanceScore(place.distance_meters)
      score += getBudgetScore(place.price_level, params.preferences.budget_level)
      score += getRiskScore(risk?.risk_level, risk?.risk_score)
      score += getWeatherScore(place, rainy)
      score += getPreferenceModeScore(place, params.preferences.preference_mode)

      if (place.is_open === false) {
        score -= 35
      } else if (place.is_open === true) {
        score += 8
      }

      if (place.rating != null) {
        score += place.rating * 3
      }

      score = Math.round(score * 100) / 100

      return {
        id: place.id,
        name: place.name,
        category: place.category,
        actionType: inferActionType(place.category),
        reason: buildReason({
          place,
          preferences: params.preferences,
          risk,
          rainy,
          distanceMeters: place.distance_meters,
        }),
        score,
        distanceMeters: place.distance_meters,
        latitude: place.latitude,
        longitude: place.longitude,
        riskLevel: risk?.risk_level ?? "CAUTION",
        riskScore: risk?.risk_score ?? 50,
        priceLevel: place.price_level,
        rating: place.rating,
        isOpen: place.is_open,
      }
    })
    .sort((a, b) => b.score - a.score)
}

