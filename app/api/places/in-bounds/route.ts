import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { getPlacesInBounds } from "@/lib/travel/service"

const boundsQuerySchema = z.object({
  minLat: z.coerce.number().min(-90).max(90),
  minLng: z.coerce.number().min(-180).max(180),
  maxLat: z.coerce.number().min(-90).max(90),
  maxLng: z.coerce.number().min(-180).max(180),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = boundsQuerySchema.parse(Object.fromEntries(searchParams))
    const places = await getPlacesInBounds(query)

    return NextResponse.json({
      ok: true,
      places,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные границы карты.",
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
