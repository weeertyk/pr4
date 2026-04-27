import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { DEMO_CITY_CENTER } from "@/lib/travel/demo"
import { getNextRecommendation } from "@/lib/travel/service"
import { userQuerySchema } from "@/lib/travel/schemas"

const recommendationQuerySchema = userQuerySchema.extend({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(3).max(20).optional().default(8),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = Object.fromEntries(searchParams)
    const parsed = recommendationQuerySchema.parse(raw)
    const lat = parsed.lat ?? DEMO_CITY_CENTER.lat
    const lng = parsed.lng ?? DEMO_CITY_CENTER.lng

    const data = await getNextRecommendation({
      userId: parsed.userId,
      lat,
      lng,
      limit: parsed.limit,
    })

    return NextResponse.json({
      ok: true,
      ...data,
      queryLocation: { lat, lng },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос рекомендации.",
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
