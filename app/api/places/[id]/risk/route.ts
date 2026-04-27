import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { placeRiskParamsSchema } from "@/lib/travel/schemas"
import { getPlaceRisk } from "@/lib/travel/service"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const params = placeRiskParamsSchema.parse(await context.params)
    const risk = await getPlaceRisk(params.id)

    if (!risk) {
      return NextResponse.json(
        {
          ok: false,
          error: "Risk data not found for this place.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      ok: true,
      risk,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный идентификатор места.",
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
