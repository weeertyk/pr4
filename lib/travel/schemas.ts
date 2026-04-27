import { z } from "zod"
import {
  budgetLevels,
  eventSeverities,
  eventTypes,
  preferenceModes,
  riskLevels,
} from "@/lib/travel/domain"
import { DEMO_USER_ID } from "@/lib/travel/demo"

const uuidSchema = z.string().uuid().catch(DEMO_USER_ID)

export const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

export const userQuerySchema = z.object({
  userId: uuidSchema.optional().default(DEMO_USER_ID),
})

export const nearbyPlacesQuerySchema = coordinatesSchema.extend({
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
})

export const areaSafetyQuerySchema = coordinatesSchema

export const onboardingBodySchema = z.object({
  userId: uuidSchema.optional().default(DEMO_USER_ID),
  budgetLevel: z.enum(budgetLevels),
  preferenceMode: z.enum(preferenceModes),
  travelStyles: z.array(z.string().min(1)).min(1),
  language: z.string().min(2).max(10).optional().default("ru"),
  cityMode: z.boolean().optional().default(true),
})

export const rebuildBodySchema = z.object({
  userId: uuidSchema.optional().default(DEMO_USER_ID),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  event: z
    .object({
      type: z.enum(eventTypes),
      severity: z.enum(eventSeverities).optional().default("MEDIUM"),
      description: z.string().min(1).optional(),
      relatedPlaceId: z.string().uuid().optional(),
    })
    .optional(),
})

export const placeRiskParamsSchema = z.object({
  id: z.string().uuid(),
})

export const riskLevelSchema = z.enum(riskLevels)

export const contextBodySchema = z.object({
  userId: uuidSchema.optional().default(DEMO_USER_ID),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  weatherCode: z.number().int().optional(),
  source: z.string().min(1).optional().default("device"),
})
