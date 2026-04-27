export const budgetLevels = ["ECONOMY", "BALANCED", "PREMIUM"] as const
export const preferenceModes = ["EFFICIENCY", "SAFETY", "EXPLORATION"] as const
export const tripStatuses = ["ACTIVE", "PAUSED", "DISRUPTED", "COMPLETED"] as const
export const planStatuses = ["DRAFT", "ACTIVE", "REBUILT", "COMPLETED", "CANCELLED"] as const
export const planItemStatuses = ["PLANNED", "IN_PROGRESS", "DONE", "SKIPPED", "REPLACED"] as const
export const riskLevels = ["SAFE", "CAUTION", "AVOID"] as const
export const eventTypes = ["WEATHER", "PLACE_CLOSED", "DELAY", "USER_CHANGE", "TRANSPORT_ISSUE"] as const
export const eventSeverities = ["LOW", "MEDIUM", "HIGH"] as const
export const actionTypes = ["VISIT", "EAT", "REST", "REROUTE", "WAIT", "SHELTER"] as const
export const placeCategories = [
  "CAFE",
  "RESTAURANT",
  "MUSEUM",
  "PARK",
  "VIEWPOINT",
  "TRANSPORT",
  "SHOP",
  "HOTEL",
  "LANDMARK",
] as const

export type BudgetLevel = (typeof budgetLevels)[number]
export type PreferenceMode = (typeof preferenceModes)[number]
export type TripStatus = (typeof tripStatuses)[number]
export type PlanStatus = (typeof planStatuses)[number]
export type PlanItemStatus = (typeof planItemStatuses)[number]
export type RiskLevel = (typeof riskLevels)[number]
export type EventType = (typeof eventTypes)[number]
export type EventSeverity = (typeof eventSeverities)[number]
export type ActionType = (typeof actionTypes)[number]
export type PlaceCategory = (typeof placeCategories)[number]
