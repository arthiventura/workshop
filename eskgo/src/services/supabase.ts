/**
 * Ponto de entrada do Supabase (ainda NÃO conectado).
 *
 * Para integrar:
 *   1. npm install @supabase/supabase-js
 *   2. Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (e nas env vars da Vercel)
 *   3. Rodar supabase/migrations/0001_schema_inicial.sql no projeto Supabase
 *   4. Descomentar o client abaixo e trocar `storage` em src/services/storage.ts
 *
 * A anon key é pública por design; a segurança vem das políticas RLS do banco.
 * A service role key NUNCA entra no front.
 */
import { env, isSupabaseConfigured } from '../config/env'

// import { createClient } from '@supabase/supabase-js'
// export const supabase = isSupabaseConfigured ? createClient(env.supabaseUrl, env.supabaseAnonKey) : null

export const supabaseStatus = {
  configured: isSupabaseConfigured,
  url: env.supabaseUrl,
} as const
