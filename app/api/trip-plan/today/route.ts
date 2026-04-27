import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { userQuerySchema } from "@/lib/travel/schemas"
import { getTodayPlan } from "@/lib/travel/service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = userQuerySchema.parse(Object.fromEntries(searchParams))
    const plan = await getTodayPlan(query.userId)

    if (!plan) {
      return NextResponse.json(
        {
          ok: false,
          error: "План на сегодня не найден.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      ok: true,
      ...plan,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос плана поездки.",
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
