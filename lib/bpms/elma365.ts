import { getServerEnv } from "@/lib/env"

interface ElmaStartProcessPayload {
  poiId: string;
  poiName: string;
  reporterEmail: string;
  description: string;
}

export async function startSafetyVerificationProcess(payload: ElmaStartProcessPayload) {
  // Используем переменные окружения напрямую (не через env.ts, так как они могли быть не добавлены в схему)
  const elmaUrl = process.env.ELMA365_API_URL;
  const token = process.env.ELMA365_TOKEN;

  if (!elmaUrl || !token) {
    console.warn("ELMA365 integration is bypassed: ELMA365_API_URL or ELMA365_TOKEN is missing.");
    return { success: false, bypassed: true };
  }

  try {

    const requestBody = {
      context: {
        __name: `Жалоба на: ${payload.poiName}`,
        opisanie_zhaloby: payload.description,
        email: payload.reporterEmail
      }
    };

    console.log("[DEBUG ELMA365] Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(elmaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[DEBUG ELMA365] Response error body:', errorBody);
      throw new Error(`ELMA365 API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[DEBUG ELMA365] Response success body:", JSON.stringify(result, null, 2));
    
    // Возвращаем идентификатор созданного элемента (если он присутствует)
    return { success: true, itemId: result.id || result.item?.id || "mock-id" };
  } catch (error: any) {
    console.error("Failed to trigger ELMA365 process:", error);
    return { success: false, error: error.message };
  }
}
