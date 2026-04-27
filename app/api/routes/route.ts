import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { getServerEnv } from "@/lib/env"
import { DEMO_CITY_CENTER } from "@/lib/travel/demo"

const routeQuerySchema = z.object({
  startLat: z.coerce.number().min(-90).max(90).optional().default(DEMO_CITY_CENTER.lat),
  startLng: z.coerce.number().min(-180).max(180).optional().default(DEMO_CITY_CENTER.lng),
  endLat: z.coerce.number().min(-90).max(90),
  endLng: z.coerce.number().min(-180).max(180),
  destinationName: z.string().min(1).optional().default("Точка назначения"),
  profile: z.enum(["foot-walking"]).optional().default("foot-walking"),
})

type OpenRouteStep = {
  instruction?: string
  distance?: number
  way_points?: number[]
}

function formatFallbackSteps(destinationName: string, distanceMeters: number) {
  const firstLeg = Math.max(Math.round(distanceMeters * 0.7), 80)
  const secondLeg = Math.max(Math.round(distanceMeters * 0.3), 40)

  return [
    {
      instruction: "Двигайтесь в сторону точки назначения",
      distance: firstLeg,
      street: "Выберите самый прямой видимый пешеходный путь",
    },
    {
      instruction: `Продолжайте движение к "${destinationName}"`,
      distance: secondLeg,
      street: "Следуйте по финальному участку маршрута",
    },
    {
      instruction: "Вы на месте",
      distance: 0,
      street: destinationName,
    },
  ]
}

function estimateDistanceMeters(startLat: number, startLng: number, endLat: number, endLng: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadius = 6371000
  const dLat = toRad(endLat - startLat)
  const dLng = toRad(endLng - startLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(startLat)) * Math.cos(toRad(endLat)) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function buildFallbackResponse(input: z.infer<typeof routeQuerySchema>) {
  const distanceMeters = Math.round(
    estimateDistanceMeters(input.startLat, input.startLng, input.endLat, input.endLng),
  )
  const durationSeconds = Math.round(distanceMeters / 1.35)

  return {
    ok: true,
    provider: "fallback",
    geometry: [
      [input.startLng, input.startLat],
      [input.endLng, input.endLat],
    ],
    summary: {
      distanceMeters,
      durationSeconds,
    },
    steps: formatFallbackSteps(input.destinationName, distanceMeters),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = routeQuerySchema.parse(Object.fromEntries(searchParams))
    const env = getServerEnv()

    if (!env.OPENROUTESERVICE_API_KEY) {
      return NextResponse.json(buildFallbackResponse(query))
    }

    const response = await fetch(`https://api.openrouteservice.org/v2/directions/${query.profile}`, {
      method: "POST",
      headers: {
        Authorization: env.OPENROUTESERVICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [query.startLng, query.startLat],
          [query.endLng, query.endLat],
        ],
        instructions: true,
        language: "ru",
      }),
    })

    if (!response.ok) {
      return NextResponse.json(buildFallbackResponse(query))
    }

    const json = await response.json()
    const feature = json?.features?.[0]
    const segment = feature?.properties?.segments?.[0]
    const coordinates = feature?.geometry?.coordinates ?? []
    const steps = (segment?.steps ?? []).map((step: OpenRouteStep) => ({
      instruction: step.instruction ?? "Продолжайте движение",
      distance: Math.round(step.distance ?? 0),
      street: "",
    }))

    return NextResponse.json({
      ok: true,
      provider: "openrouteservice",
      geometry: coordinates,
      summary: {
        distanceMeters: Math.round(segment?.distance ?? 0),
        durationSeconds: Math.round(segment?.duration ?? 0),
      },
      steps,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные параметры маршрута.",
          issues: error.flatten(),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка сервера.",
      },
      { status: 500 },
    )
  }
}
