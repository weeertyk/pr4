import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { nearbyPlacesQuerySchema } from "@/lib/travel/schemas"
import { getNearbyPlaces } from "@/lib/travel/service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = nearbyPlacesQuerySchema.parse(Object.fromEntries(searchParams))
    const places = await getNearbyPlaces(query)

    return NextResponse.json({
      ok: true,
      places,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос ближайших мест.",
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
