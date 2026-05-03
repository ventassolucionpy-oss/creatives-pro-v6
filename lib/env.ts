import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  ANTHROPIC_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  HOTMART_WEBHOOK_SECRET: z.string().min(8).optional(),
})

export function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    HOTMART_WEBHOOK_SECRET: process.env.HOTMART_WEBHOOK_SECRET,
  })

  if (!parsed.success) {
    console.warn('⚠️ Algunas variables de entorno no están configuradas:', parsed.error.format())
  }

  return parsed.data || {}
}

export const env = validateEnv()
