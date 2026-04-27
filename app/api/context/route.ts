import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { contextBodySchema, userQuerySchema } from "@/lib/travel/schemas"
import { getLatestUserContext, setUserContext } from "@/lib/travel/service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = userQuerySchema.parse(Object.fromEntries(searchParams))
    const context = await getLatestUserContext(query.userId)

    return NextResponse.json({
      ok: true,
      context,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный запрос контекста.",
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
    const body = contextBodySchema.parse(json)
    const context = await setUserContext(body)

    return NextResponse.json({
      ok: true,
      context,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные данные контекста.",
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
