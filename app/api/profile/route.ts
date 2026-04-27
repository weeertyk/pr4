import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { getUserPreferences, getUserProfile, upsertUserProfile } from "@/lib/travel/service"

const profileQuerySchema = z.object({
  userId: z.string().uuid(),
})

const profileBodySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(120).optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = profileQuerySchema.parse(Object.fromEntries(searchParams))

    const [profile, preferences] = await Promise.all([
      getUserProfile(query.userId),
      getUserPreferences(query.userId),
    ])

    return NextResponse.json({
      ok: true,
      profile,
      preferences,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос профиля.",
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

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = profileBodySchema.parse(json)
    const profile = await upsertUserProfile(body)

    return NextResponse.json({
      ok: true,
      profile,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные данные профиля.",
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
