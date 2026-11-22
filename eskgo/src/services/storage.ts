/**
 * Persistência do estado do app.
 *
 * Hoje: localStorage (um aparelho, sem login real).
 * Depois: Supabase — trocar a implementação aqui sem mexer nas telas.
 * Esquema das tabelas: supabase/migrations/ (5 migrations já aplicadas; ver docs/banco/README.md)
 */
import type { AppState } from '../lib/types'

// v3: paleta dourada (cor de cartão 'lilac' → 'champagne') — descarta dados de demo antigos
const KEY = 'eskgo:state:v3'

export interface StateStorage {
  load(): AppState | null
  save(state: AppState): void
  clear(): void
}

export const localStateStorage: StateStorage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as AppState
      return parsed.version === 1 ? parsed : null
    } catch {
      return null
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage cheio ou bloqueado: o app segue em memória */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}

export const storage: StateStorage = localStateStorage
