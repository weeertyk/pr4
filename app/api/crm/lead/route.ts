import { NextResponse } from "next/server";
import { createBitrixLead } from "@/lib/crm/bitrix24";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      email,
      name,
      budgetLevel,
      travelStyles,
      language,
      location,
      tripId
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 }
      );
    }

    console.log("Данные, полученные для отправки в CRM:", JSON.stringify(body, null, 2));

    const result = await createBitrixLead({
      title: `${name || email || userId}`,
      name: name,
      email: email,
      budgetLevel: budgetLevel,
      travelStyles: travelStyles,
      language: language,
      location: location,
      tripId: tripId,
      comments: `ID пользователя в системе: ${userId}`,
    });

    return NextResponse.json({
      success: true,
      crmId: result?.result || null,
    });
  } catch (error: any) {
    console.error("CRM Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
