import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    // 2. Чтение и валидация тела запроса
    const body = await req.json()
    const { email, title, message } = body

    // 1. Проверка авторизации вебхука по API ключу безопасности
    const apiKeyHeader = req.headers.get("x-api-key")
    const urlKey = new URL(req.url).searchParams.get("key")
    const bodyKey = body.key || body.api_key
    const systemApiKey = process.env.BPMS_API_KEY

    const providedKey = apiKeyHeader || urlKey || bodyKey

    if (!providedKey || providedKey !== systemApiKey) {
      console.warn("[DEBUG Notification Webhook] Unauthorized request attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email || !title || !message) {
      return NextResponse.json({ error: "Missing required fields: email, title, or message" }, { status: 400 })
    }

    console.log(`[DEBUG Notification Webhook] Received notification for ${email}: "${title}"`)

    const supabase = getSupabaseAdmin()

    // 3. Добавление записи уведомления в Supabase
    const { data: inserted, error } = await supabase
      .from("notifications")
      .insert({
        user_email: email,
        title,
        message,
        is_read: false,
      })
      .select("id")
      .single()

    if (error) {
      throw error;
    }

    console.log(`[DEBUG Notification Webhook] Successfully saved notification ${inserted?.id} for user ${email}`)

    return NextResponse.json({ success: true, notificationId: inserted?.id })
  } catch (error) {
    console.error("[DEBUG Notification Webhook] Fatal error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
