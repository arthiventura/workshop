import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createSeed } from './seed'
import { CATEGORIES, type AppState, type Card, type Category, type Goal, type Transaction } from './types'
import { pct, uid } from './format'
import { storage } from '../services/storage'
import { supabase } from '../services/supabase'
import { authErrorMessage, emptyState, loadSnapshot, persist, syncErrorMessage } from '../services/remote'

type WithId<T> = Omit<T, 'id'> & { id?: string }

export type Action =
  | { type: 'tx/add'; tx: WithId<Transaction> }
  | { type: 'tx/import'; txs: WithId<Omit<Transaction, 'cardId'>>[]; cardId: string | null; file?: File }
  | { type: 'tx/update'; tx: Transaction }
  | { type: 'tx/delete'; id: string }
  | { type: 'card/add'; card: WithId<Card> }
  | { type: 'card/update'; card: Card }
  | { type: 'card/delete'; id: string }
  | { type: 'goal/add'; goal: WithId<Goal> }
  | { type: 'goal/update'; goal: Goal }
  | { type: 'goal/delete'; id: string }
  | { type: 'goal/restore'; goal: Goal; index: number }
  | { type: 'goal/save'; id: string; amount: number }
  | { type: 'budget/category'; category: Category; value: number }
  | { type: 'budget/total'; value: number }
  | { type: 'ui/hideBalance'; value?: boolean }
  | { type: 'ui/plus'; value?: boolean }
  | { type: 'auth/login'; email: string; name?: string }
  | { type: 'auth/logout' }
  | { type: 'demo/reset' }
  | { type: 'remote/hydrate'; state: AppState }

/** Ajusta saldo e fatura do cartão quando um gasto entra (+1) ou sai (−1). */
function applyTx(s: AppState, t: Pick<Transaction, 'amount' | 'cardId'>, sign: 1 | -1): AppState {
  return {
    ...s,
    balance: round(s.balance - sign * t.amount),
    cards: t.cardId ? s.cards.map((c) => (c.id === t.cardId ? { ...c, invoice: round(c.invoice + sign * t.amount) } : c)) : s.cards,
  }
}
const round = (n: number) => Math.round(n * 100) / 100

/**
 * Completa a ação antes do reducer: ids novos (uuid) e posição da meta.
 * Assim o reducer fica puro e o mesmo id vai para a tela e para o banco.
 */
function prepare(a: Action, s: AppState): Action {
  switch (a.type) {
    case 'tx/add':
      return { ...a, tx: { ...a.tx, id: a.tx.id ?? uid() } }
    case 'tx/import':
      return { ...a, txs: a.txs.map((t) => ({ ...t, id: t.id ?? uid() })) }
    case 'card/add':
      return { ...a, card: { ...a.card, id: a.card.id ?? uid() } }
    case 'goal/add': {
      const position = s.goals.reduce((max, g, i) => Math.max(max, g.position ?? i), -1) + 1
      return { ...a, goal: { ...a.goal, id: a.goal.id ?? uid(), position: a.goal.position ?? position } }
    }
    default:
      return a
  }
}

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'tx/add': {
      const t = { ...a.tx, id: a.tx.id ?? uid() }
      return { ...applyTx(s, t, 1), transactions: [t, ...s.transactions] }
    }
    case 'tx/import': {
      // a fatura lida vira lançamentos; o valor da fatura do cartão passa a ser o total lido
      const added = a.txs.map((t) => ({ ...t, cardId: a.cardId, id: t.id ?? uid() }))
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
      return { ...s, cards: [{ ...a.card, id: a.card.id ?? uid() }, ...s.cards] }
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
      // o "Já guardado" sai do saldo, igual a "Guardar" (e excluir a meta devolve tudo ao saldo)
      return { ...s, balance: round(s.balance - a.goal.saved), goals: [...s.goals, { ...a.goal, id: a.goal.id ?? uid() }] }
    case 'goal/update':
      // nome, alvo e data; o valor guardado só muda por "guardar", para o saldo não sair do lugar
      return { ...s, goals: s.goals.map((g) => (g.id === a.goal.id ? { ...a.goal, saved: g.saved } : g)) }
    case 'goal/delete': {
      // o que estava guardado na meta volta para o saldo
      const prev = s.goals.find((g) => g.id === a.id)
      if (!prev) return s
      return { ...s, balance: round(s.balance + prev.saved), goals: s.goals.filter((g) => g.id !== a.id) }
    }
    case 'goal/restore': {
      if (s.goals.some((g) => g.id === a.goal.id)) return s
      const goals = [...s.goals]
      goals.splice(Math.min(a.index, goals.length), 0, a.goal)
      return { ...s, balance: round(s.balance - a.goal.saved), goals }
    }
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
      return { ...s, signedIn: true, user: { ...s.user, email: a.email, name: a.name || s.user.name } }
    case 'auth/logout':
      return { ...s, signedIn: false }
    case 'demo/reset':
      return createSeed()
    case 'remote/hydrate':
      return a.state
  }
}

/* ───────── Provider: Supabase (online) ou localStorage (offline) ───────── */

export type SignUpResult = { error?: string; needsConfirmation?: boolean }

interface StoreValue {
  state: AppState
  dispatch: (a: Action) => void
  /** "remote" = Supabase ligado (login real, dados no banco); "local" = só neste aparelho */
  mode: 'remote' | 'local'
  /** carregando a sessão ou os dados do banco */
  loading: boolean
  /** último erro ao gravar no banco (a tela mostra um aviso) */
  syncError: { id: number; message: string } | null
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>
}

const Ctx = createContext<StoreValue | null>(null)

/** `offline` força o modo localStorage (Storybook usa, para ter dados de exemplo sem login). */
export function StoreProvider({ children, offline = false }: { children: ReactNode; offline?: boolean }) {
  return supabase && !offline ? <RemoteStoreProvider>{children}</RemoteStoreProvider> : <LocalStoreProvider>{children}</LocalStoreProvider>
}

const loadLocal = (): AppState => storage.load() ?? createSeed()

function LocalStoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadLocal)
  useEffect(() => storage.save(state), [state])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      dispatch: rawDispatch,
      mode: 'local',
      loading: false,
      syncError: null,
      signIn: async (email) => {
        rawDispatch({ type: 'auth/login', email })
        return null
      },
      signUp: async (name, email) => {
        rawDispatch({ type: 'auth/login', email, name })
        return {}
      },
    }),
    [state],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function RemoteStoreProvider({ children }: { children: ReactNode }) {
  const sb = supabase!
  const [state, rawDispatch] = useReducer(reducer, undefined, emptyState)
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<StoreValue['syncError']>(null)

  const stateRef = useRef(state)
  const session = useRef<Session | null>(null)
  /** fila: uma gravação por vez, na ordem em que a pessoa fez */
  const queue = useRef<Promise<void>>(Promise.resolve())
  const pending = useRef(0)
  /** muda a cada ação; uma leitura que começou antes de uma ação nova é descartada */
  const generation = useRef(0)

  const hydrate = useCallback((s: AppState) => {
    stateRef.current = s
    rawDispatch({ type: 'remote/hydrate', state: s })
  }, [])

  /** Relê tudo do banco (a fonte da verdade) quando não há gravação pendente. */
  const refresh = useCallback(async () => {
    const current = session.current
    if (!current) return
    const gen = generation.current
    try {
      const snap = await loadSnapshot(sb, current)
      if (gen === generation.current && pending.current === 0 && session.current?.user.id === current.user.id) hydrate(snap)
    } catch (e) {
      setSyncError({ id: Date.now(), message: syncErrorMessage(e) })
    }
  }, [sb, hydrate])

  useEffect(() => {
    const { data } = sb.auth.onAuthStateChange((event, next) => {
      const changedUser = session.current?.user.id !== next?.user.id
      session.current = next
      if (!next) {
        hydrate(emptyState())
        setLoading(false)
        return
      }
      if (event === 'INITIAL_SESSION' || (event === 'SIGNED_IN' && changedUser)) {
        if (changedUser) hydrate(emptyState())
        setLoading(true)
        // fora do callback do Auth (chamar o Supabase aqui dentro pode travar)
        window.setTimeout(() => void refresh().finally(() => setLoading(false)), 0)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [sb, hydrate, refresh])

  const dispatch = useCallback(
    (action: Action) => {
      if (action.type === 'auth/logout') {
        void sb.auth.signOut()
        return
      }
      // login e "restaurar exemplo" não existem no modo online (o login passa pelo Supabase Auth)
      if (action.type === 'auth/login' || action.type === 'demo/reset' || action.type === 'remote/hydrate') return
      const userId = session.current?.user.id
      if (!userId) return

      const prev = stateRef.current
      const a = prepare(action, prev)
      const next = reducer(prev, a)
      stateRef.current = next
      rawDispatch(a) // aparece na hora; o banco confirma depois

      generation.current += 1
      pending.current += 1
      queue.current = queue.current
        .then(() => persist(sb, userId, a, prev, next))
        .catch((e) => setSyncError({ id: Date.now(), message: syncErrorMessage(e) }))
        .finally(() => {
          pending.current -= 1
          if (pending.current === 0) void refresh()
        })
    },
    [sb, refresh],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      return error ? authErrorMessage(error) : null
    },
    [sb],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<SignUpResult> => {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } })
      if (error) return { error: authErrorMessage(error) }
      // com confirmação de e-mail ligada, a conta nasce sem sessão até clicar no link
      return { needsConfirmation: !data.session }
    },
    [sb],
  )

  const value = useMemo<StoreValue>(() => ({ state, dispatch, mode: 'remote', loading, syncError, signIn, signUp }), [state, dispatch, loading, syncError, signIn, signUp])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
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
