import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// GET: Получение всех уведомлений пользователя
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Unauthorized or missing email" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch notifications:", error)
      return NextResponse.json({ notifications: [], error: "Failed to load notifications" })
    }

    return NextResponse.json({ success: true, notifications: notifications || [] })
  } catch (error: any) {
    console.error("Error in notifications route:", error)
    return NextResponse.json({ notifications: [], error: "Internal Server Error" })
  }
}

// PATCH: Пометка всех уведомлений как прочитанных
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = body.email || new URL(request.url).searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Unauthorized or missing email" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_email", email)

    if (error) {
      console.error("Failed to update notifications read status:", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE: Полная очистка уведомлений пользователя
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Unauthorized or missing email" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_email", email)

    if (error) {
      console.error("Failed to clear notifications:", error)
      return NextResponse.json({ error: "Failed to clear notifications" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error clearing notifications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST: Для пометки одного конкретного уведомления прочитанным (доп. функция для интерфейса)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
