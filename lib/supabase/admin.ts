import { createClient } from "@supabase/supabase-js"
import { getServerEnv } from "@/lib/env"

let cachedAdminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient
  }

  const env = getServerEnv()

  cachedAdminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  return cachedAdminClient
}

