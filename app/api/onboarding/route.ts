import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { onboardingBodySchema } from "@/lib/travel/schemas"
import { upsertUserPreferences } from "@/lib/travel/service"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = onboardingBodySchema.parse(json)
    const preferences = await upsertUserPreferences(body)

    return NextResponse.json({
      ok: true,
      preferences,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные данные онбординга.",
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
