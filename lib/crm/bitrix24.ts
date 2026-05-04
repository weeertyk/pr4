/**
 * Сервис для интеграции с Bitrix24 через REST API (Inbound Webhooks).
 */

export interface BitrixLeadData {
  title: string;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  comments?: string;
  budgetLevel?: string;
  travelStyles?: string[];
  language?: string;
  location?: string;
  tripId?: string;
}

/**
 * Отправляет данные лида в Bitrix24.
 * В продакшене BITRIX24_WEBHOOK_URL должен быть в .env.local
 */
export async function createBitrixLead(data: BitrixLeadData) {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("BITRIX24_WEBHOOK_URL не настроен. Пропуск интеграции с CRM.");
    return null;
  }

  // Маппинг системных ID в значения вашей CRM (Bitrix24)
  const budgetMap: Record<string, number> = {
    ECONOMY: 44,
    BALANCED: 46,
    PREMIUM: 48,
  };

  const styleMap: Record<string, number> = {
    solo: 50,
    family: 52,
    adventure: 54,
    culture: 56,
    gastronomy: 58,
  };

  const langMap: Record<string, number> = {
    ru: 60,
    en: 62,
  };

  const fields = {
    TITLE: data.title,
    NAME: data.name,
    LAST_NAME: data.lastName,
    EMAIL: [{ VALUE: data.email, VALUE_TYPE: "WORK" }],
    COMMENTS: data.comments,
    // Кастомные поля (используем ваши числовые ID из Битрикса)
    UF_CRM_1777896952180: budgetMap[data.budgetLevel || "BALANCED"],
    UF_CRM_1777897205131: data.travelStyles?.map(s => styleMap[s]).filter(Boolean),
    UF_CRM_1777897265805: langMap[data.language || "ru"],
    UF_CRM_1777897288197: data.location,
    UF_CRM_1777897346584: data.tripId,
    SOURCE_ID: "WEB",
  };

  try {
    console.log("Финальный объект fields для Bitrix24:", JSON.stringify(fields, null, 2));

    const response = await fetch(`${webhookUrl}crm.lead.add.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Bitrix24 Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при создании лида в Bitrix24:", error);
    throw error;
  }
}
