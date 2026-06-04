import { z } from "zod"

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENROUTESERVICE_API_KEY: z.string().min(1).optional(),
  ELMA365_BASE_URL: z.string().url().optional(),
  ELMA365_TOKEN: z.string().min(1).optional(),

})

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null

export function getServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse(process.env)
  }

  return cachedServerEnv
}
