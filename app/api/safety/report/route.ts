import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { startSafetyVerificationProcess } from "@/lib/bpms/elma365"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { poiId, email, description } = body

    if (!poiId || !email || !description) {
      return NextResponse.json(
        { error: "poiId, email, and description are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin() as any

    // 1. Проверяем, существует ли указанный POI
    const { data: place, error: placeError } = await supabase
      .from("places")
      .select("id, name")
      .eq("id", poiId)
      .single()

    if (placeError || !place) {
      return NextResponse.json(
        { error: `POI with ID ${poiId} not found` },
        { status: 404 }
      )
    }

    // 2. Создаем запись о жалобе в Supabase
    const { data: report, error: reportError } = await supabase
      .from("safety_reports")
      .insert({
        poi_id: poiId,
        reporter_email: email,
        description,
        status: "PENDING"
      })
      .select()
      .single()

    if (reportError) {
      console.error("Failed to insert safety report:", reportError)
      return NextResponse.json(
        { error: "Failed to save safety report in database" },
        { status: 500 }
      )
    }

    // 3. Запускаем бизнес-процесс в ELMA365
    const elmaResult = await startSafetyVerificationProcess({
      poiId,
      poiName: place.name,
      reporterEmail: email,
      description
    })

    return NextResponse.json({
      success: true,
      report,
      elmaIntegration: elmaResult
    })
  } catch (error: any) {
    console.error("Error in safety report route:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
