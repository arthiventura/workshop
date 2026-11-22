import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createSeed } from './seed'
import { CATEGORIES, type AppState, type Card, type Category, type Goal, type Transaction } from './types'
import { pct, uid } from './format'
import { storage } from '../services/storage'

type Action =
  | { type: 'tx/add'; tx: Omit<Transaction, 'id'> }
  | { type: 'tx/import'; txs: Omit<Transaction, 'id' | 'cardId'>[]; cardId: string | null }
  | { type: 'tx/update'; tx: Transaction }
  | { type: 'tx/delete'; id: string }
  | { type: 'card/add'; card: Omit<Card, 'id'> }
  | { type: 'card/update'; card: Card }
  | { type: 'card/delete'; id: string }
  | { type: 'goal/add'; goal: Omit<Goal, 'id'> }
  | { type: 'goal/save'; id: string; amount: number }
  | { type: 'budget/category'; category: Category; value: number }
  | { type: 'budget/total'; value: number }
  | { type: 'ui/hideBalance'; value?: boolean }
  | { type: 'ui/plus'; value?: boolean }
  | { type: 'auth/login'; email: string }
  | { type: 'auth/logout' }
  | { type: 'demo/reset' }

/** Ajusta saldo e fatura do cartão quando um gasto entra (+1) ou sai (−1). */
function applyTx(s: AppState, t: Pick<Transaction, 'amount' | 'cardId'>, sign: 1 | -1): AppState {
  return {
    ...s,
    balance: round(s.balance - sign * t.amount),
    cards: t.cardId ? s.cards.map((c) => (c.id === t.cardId ? { ...c, invoice: round(c.invoice + sign * t.amount) } : c)) : s.cards,
  }
}
const round = (n: number) => Math.round(n * 100) / 100

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'tx/add': {
      const t = { ...a.tx, id: uid() }
      return { ...applyTx(s, t, 1), transactions: [t, ...s.transactions] }
    }
    case 'tx/import': {
      // a fatura lida vira lançamentos; o valor da fatura do cartão passa a ser o total lido
      const added = a.txs.map((t) => ({ ...t, cardId: a.cardId, id: uid() }))
      const sum = round(added.reduce((acc, t) => acc + t.amount, 0))
      return {
        ...s,
        balance: round(s.balance - sum),
        cards: s.cards.map((c) => (c.id === a.cardId ? { ...c, invoice: sum } : c)),
        transactions: [...added, ...s.transactions],
      }
    }
    case 'tx/update': {
      const prev = s.transactions.find((t) => t.id === a.tx.id)
      if (!prev) return s
      const next = applyTx(applyTx(s, prev, -1), a.tx, 1)
      return { ...next, transactions: s.transactions.map((t) => (t.id === a.tx.id ? a.tx : t)) }
    }
    case 'tx/delete': {
      const prev = s.transactions.find((t) => t.id === a.id)
      if (!prev) return s
      return { ...applyTx(s, prev, -1), transactions: s.transactions.filter((t) => t.id !== a.id) }
    }
    case 'card/add':
      return { ...s, cards: [{ ...a.card, id: uid() }, ...s.cards] }
    case 'card/update':
      return { ...s, cards: s.cards.map((c) => (c.id === a.card.id ? a.card : c)) }
    case 'card/delete':
      // os gastos desse cartão continuam no histórico, como "Dinheiro / Pix" (no banco: on delete set null)
      return {
        ...s,
        cards: s.cards.filter((c) => c.id !== a.id),
        transactions: s.transactions.map((t) => (t.cardId === a.id ? { ...t, cardId: null } : t)),
      }
    case 'goal/add':
      return { ...s, goals: [...s.goals, { ...a.goal, id: uid() }] }
    case 'goal/save':
      return {
        ...s,
        balance: round(s.balance - a.amount),
        goals: s.goals.map((g) => (g.id === a.id ? { ...g, saved: round(g.saved + a.amount) } : g)),
      }
    case 'budget/category':
      return { ...s, budget: { ...s.budget, byCategory: { ...s.budget.byCategory, [a.category]: a.value } } }
    case 'budget/total':
      return { ...s, budget: { ...s.budget, total: a.value } }
    case 'ui/hideBalance':
      return { ...s, hideBalance: a.value ?? !s.hideBalance }
    case 'ui/plus':
      return { ...s, plus: a.value ?? !s.plus }
    case 'auth/login':
      return { ...s, signedIn: true, user: { ...s.user, email: a.email } }
    case 'auth/logout':
      return { ...s, signedIn: false }
    case 'demo/reset':
      return createSeed()
  }
}

const load = (): AppState => storage.load() ?? createSeed()

const Ctx = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => storage.save(state), [state])
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore fora do StoreProvider')
  return v
}

/* ───────── ViewModel da home / metas ───────── */

export interface CategorySummary {
  category: Category
  spent: number
  share: number // % do mês
  limit: number
  used: number // % do teto
}

export function useMonth() {
  const { state } = useStore()
  return useMemo(() => {
    const now = new Date()
    const monthTx = state.transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    const total = round(monthTx.reduce((sum, t) => sum + t.amount, 0))
    const categories: CategorySummary[] = CATEGORIES.map((category) => {
      const spent = round(monthTx.filter((t) => t.category === category).reduce((s, t) => s + t.amount, 0))
      const limit = state.budget.byCategory[category] ?? 0
      return { category, spent, share: pct(spent, total), limit, used: pct(spent, limit) }
    })
    const ranked = [...categories].filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const diff = state.previousMonthTotal > 0 ? Math.round((1 - total / state.previousMonthTotal) * 100) : 0
    return {
      total,
      transactions: monthTx,
      categories,
      ranked,
      remaining: round(state.budget.total - total),
      daysLeft: daysInMonth - now.getDate(),
      vsPrevious: diff, // positivo = gastou menos
    }
  }, [state.transactions, state.budget, state.previousMonthTotal])
}

/** Categorias separadas por claridade (não só por tom): dourado · off-white · bronze escuro · champanhe · cinza */
export const CATEGORY_COLORS: Record<Category, string> = {
  Moradia: '#C9A452',
  Alimentação: '#EFEBE1',
  Transporte: '#7A6230',
  Lazer: '#E6D3A3',
  Outros: '#85858B',
}
