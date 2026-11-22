/**
 * Único ponto de leitura das variáveis de ambiente no front.
 *
 * Só variáveis com prefixo VITE_ chegam ao navegador — e TUDO que chega ao navegador é público.
 * Chaves secretas (OpenAI, service role do Supabase) nunca entram aqui: ficam no servidor (Vercel).
 */
export type AIMode = 'mock' | 'api'

export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Eskgo',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  /** Supabase (público por design: protegido por RLS no banco) */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  /** IA do estágio 2: "mock" roda no próprio front; "api" chama as Functions em /api */
  aiMode: (import.meta.env.VITE_AI_MODE === 'api' ? 'api' : 'mock') as AIMode,
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
} as const

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
