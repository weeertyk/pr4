import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { poi_id, reporter_email, status, risk_score, risk_category } = body

    if (!poi_id || !reporter_email || !status) {
      return NextResponse.json(
        { error: "poi_id, reporter_email, and status are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin() as any

    // 1. Маппинг статусов
    let mappedStatus: "PENDING" | "INSUFFICIENT_DATA" | "VERIFIED" | "REJECTED" = "PENDING"
    if (status === "rejected_insufficient_data") {
      mappedStatus = "INSUFFICIENT_DATA"
    } else if (status === "verified") {
      mappedStatus = "VERIFIED"
    } else if (status === "rejected") {
      mappedStatus = "REJECTED"
    }

    // 2. Обновляем статус жалобы в БД safety_reports
    const { error: updateReportError } = await supabase
      .from("safety_reports")
      .update({
        status: mappedStatus,
        risk_score: risk_score ?? null,
        risk_category: risk_category ?? null
      })
      .eq("poi_id", poi_id)
      .eq("reporter_email", reporter_email)

    if (updateReportError) {
      console.error("Failed to update safety report status:", updateReportError)
      return NextResponse.json(
        { error: "Failed to update safety report status" },
        { status: 500 }
      )
    }

    let title = "Статус жалобы обновлен"
    let message = "Ваша жалоба на безопасность находится в обработке."
    if (mappedStatus === "VERIFIED") {
      title = "Угроза подтверждена"
      message = "Ваша жалоба подтверждена. Рейтинг безопасности объекта обновлен."
    } else if (mappedStatus === "REJECTED") {
      title = "Жалоба отклонена"
      message = "Модератор рассмотрел вашу жалобу и отклонил её."
    } else if (mappedStatus === "INSUFFICIENT_DATA") {
      title = "Недостаточно данных"
      message = "Для подтверждения жалобы не хватило объективных данных."
    }

    await supabase.from("notifications").insert({
      user_email: reporter_email,
      title,
      message,
    })

    // 3. Если угроза верифицирована, обновляем place_risks и оповещаем пользователей
    if (mappedStatus === "VERIFIED" && risk_score !== undefined) {
      const riskLevel = risk_score >= 70 ? "AVOID" : risk_score >= 30 ? "CAUTION" : "SAFE"
      
      // Upsert записи в place_risks
      const { error: upsertError } = await supabase
        .from("place_risks")
        .upsert(
          {
            place_id: poi_id,
            risk_level: riskLevel,
            risk_score: risk_score,
            reasons: JSON.stringify([{ category: risk_category || "General", source: "ELMA365 Verification" }])
          },
          { onConflict: "place_id" }
        )

      if (upsertError) {
        console.error("Failed to upsert place risks:", upsertError)
      }

      // Находим пользователей в радиусе 1 км
      const { data: usersNearby, error: geoError } = await supabase.rpc("get_users_near_place", {
        in_place_id: poi_id,
        in_distance_meters: 1000.0
      })

      if (geoError) {
        console.error("Failed to query nearby users:", geoError)
      } else if (usersNearby && usersNearby.length > 0) {
        // Оповещаем всех пользователей рядом, создавая им уведомления
        for (const user of usersNearby) {
          // Получаем email пользователя, если usersNearby возвращает user_id, 
          // то потребуется join, но для MVP оставляем как задел (реализуется через push).
          console.log(`Alerting user ${user.id} near place ${poi_id}`)
        }
      }
    }

    return NextResponse.json({ success: true, status: mappedStatus })
  } catch (error: any) {
    console.error("Error in safety webhook route:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
