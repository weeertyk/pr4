import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { areaSafetyQuerySchema } from "@/lib/travel/schemas"
import { getRiskZoneForPoint } from "@/lib/travel/service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = areaSafetyQuerySchema.parse(Object.fromEntries(searchParams))
    const zone = await getRiskZoneForPoint(query.lat, query.lng)

    return NextResponse.json({
      ok: true,
      zone,
      fallbackTips: [
        "Выбирайте вечером хорошо освещённые центральные маршруты.",
        "Проверяйте цены в местах с высоким туристическим потоком.",
        "Пользуйтесь официальными транспортными узлами и отмеченными точками посадки.",
      ],
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос безопасности района.",
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
