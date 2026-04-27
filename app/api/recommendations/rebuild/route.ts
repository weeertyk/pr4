import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { rebuildBodySchema } from "@/lib/travel/schemas"
import { rebuildTodayPlan } from "@/lib/travel/service"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = rebuildBodySchema.parse(json)
    const rebuilt = await rebuildTodayPlan(body)

    if (!rebuilt) {
      return NextResponse.json(
        {
          ok: false,
          error: "No active plan found for this user today.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      ok: true,
      ...rebuilt,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные данные для пересборки маршрута.",
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
