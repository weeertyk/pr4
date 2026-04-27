import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { upsertUserProfile } from "@/lib/travel/service"

const registerBodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(120),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = registerBodySchema.parse(json)
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Не удалось создать пользователя в Auth.")
    }

    const profile = await upsertUserProfile({
      id: data.user.id,
      email: data.user.email ?? body.email,
      name: body.name,
    })

    return NextResponse.json({
      ok: true,
      profile,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректные данные регистрации.",
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
