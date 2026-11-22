/**
 * Client do Supabase (navegador).
 *
 * Liga sozinho quando VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no .env (e nas env vars da Vercel).
 * Sem elas, o app roda no modo offline (localStorage), útil para o Storybook e para demo sem internet.
 *
 * A anon/publishable key é pública por design; a segurança vem das políticas RLS do banco
 * (supabase/migrations/, ver docs/banco/README.md). A service role key NUNCA entra no front.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '../config/env'

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export const supabaseStatus = {
  configured: isSupabaseConfigured,
  url: env.supabaseUrl,
} as const
