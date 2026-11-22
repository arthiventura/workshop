/**
 * Camada de dados do Supabase: lê o estado inteiro da pessoa logada e grava cada ação
 * do reducer como uma operação por entidade (tabela ou RPC atômica).
 *
 * Mapeamento app ↔ banco: docs/banco/README.md §7.
 */
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { CATEGORIES, type AppState, type Card, type CardColor, type Category, type Goal, type Transaction } from '../lib/types'
import { dueDayFromDays, dueInDays, labelToMonth, monthToLabel, uid } from '../lib/format'
import type { Action } from '../lib/store'

/* ───────── Linhas do banco ───────── */

interface ProfileRow {
  name: string
  balance: number | string
  hide_balance: boolean
  plus: boolean
}
interface CardRow {
  id: string
  nickname: string
  last4: string
  color: CardColor
  credit_limit: number | string
  invoice: number | string
  due_day: number
}
interface TxRow {
  id: string
  name: string
  category: Category
  card_id: string | null
  amount: number | string
  occurred_at: string
  source: 'manual' | 'fatura'
}
interface GoalRow {
  id: string
  name: string
  target: number | string
  saved: number | string
  due_month: string | null
  position: number
}

const num = (v: number | string | null | undefined) => Number(v ?? 0)

const toCard = (r: CardRow): Card => ({
  id: r.id,
  nickname: r.nickname,
  last4: r.last4,
  color: r.color,
  limit: num(r.credit_limit),
  invoice: num(r.invoice),
  dueInDays: dueInDays(r.due_day),
})

const toTx = (r: TxRow): Transaction => ({
  id: r.id,
  name: r.name,
  category: r.category,
  cardId: r.card_id,
  amount: num(r.amount),
  date: r.occurred_at,
  source: r.source,
})

const toGoal = (r: GoalRow): Goal => ({
  id: r.id,
  name: r.name,
  target: num(r.target),
  saved: num(r.saved),
  date: r.due_month ? monthToLabel(r.due_month) : undefined,
  position: r.position,
})

/** "Dez 2027" → "2027-12-01" | null */
const toDueMonth = (label?: string) => {
  const m = labelToMonth(label)
  return m ? `${m}-01` : null
}

const cardColumns = (c: Omit<Card, 'id'>) => ({
  nickname: c.nickname,
  last4: c.last4,
  color: c.color,
  credit_limit: c.limit,
  invoice: c.invoice,
  due_day: dueDayFromDays(c.dueInDays),
})

/** Estado vazio (sem sessão ou carregando). */
export function emptyState(): AppState {
  return {
    version: 1,
    signedIn: false,
    user: { name: '', email: '' },
    balance: 0,
    hideBalance: false,
    plus: false,
    previousMonthTotal: 0,
    transactions: [],
    cards: [],
    goals: [],
    budget: { total: 0, byCategory: Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number> },
  }
}

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) throw res.error
  return res.data
}

/** Lê tudo da pessoa logada (a RLS garante que só vêm as linhas dela). */
export async function loadSnapshot(sb: SupabaseClient, session: Session): Promise<AppState> {
  const [profile, cards, txs, goals, budget, cats, months] = await Promise.all([
    sb.from('profiles').select('name, balance, hide_balance, plus').eq('id', session.user.id).single(),
    sb.from('cards').select('id, nickname, last4, color, credit_limit, invoice, due_day').order('created_at', { ascending: false }),
    sb.from('transactions').select('id, name, category, card_id, amount, occurred_at, source').order('occurred_at', { ascending: false }),
    sb.from('goals').select('id, name, target, saved, due_month, position').order('position'),
    sb.from('budgets').select('total').eq('user_id', session.user.id).maybeSingle(),
    sb.from('budget_categories').select('category, amount'),
    sb.rpc('monthly_spending', { p_months: 2 }),
  ])

  const p = check(profile) as ProfileRow
  const byCategory = emptyState().budget.byCategory
  for (const r of (check(cats) ?? []) as { category: Category; amount: number | string }[]) byCategory[r.category] = num(r.amount)

  // total do mês anterior (o banco calcula no fuso de São Paulo)
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
  const monthRows = (check(months) ?? []) as { month: string; total: number | string }[]
  const previousMonthTotal = num(monthRows.find((r) => r.month.startsWith(prevKey))?.total)

  return {
    version: 1,
    signedIn: true,
    user: { name: p.name || session.user.email?.split('@')[0] || '', email: session.user.email ?? '' },
    balance: num(p.balance),
    hideBalance: p.hide_balance,
    plus: p.plus,
    previousMonthTotal,
    transactions: ((check(txs) ?? []) as TxRow[]).map(toTx),
    cards: ((check(cards) ?? []) as CardRow[]).map(toCard),
    goals: ((check(goals) ?? []) as GoalRow[]).map(toGoal),
    budget: { total: num((check(budget) as { total: number | string } | null)?.total), byCategory },
  }
}

/** Sobe o arquivo da fatura para o bucket privado `faturas`, na pasta da pessoa. */
async function uploadInvoice(sb: SupabaseClient, userId: string, file: File) {
  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
  const fallback: Record<string, string> = { pdf: 'application/pdf', heic: 'image/heic', heif: 'image/heif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const path = `${userId}/${new Date().toISOString().slice(0, 7)}/${uid()}.${ext}`
  check(await sb.storage.from('faturas').upload(path, file, { contentType: file.type || fallback[ext] || 'application/pdf' }))
  return path
}

/**
 * Grava no banco uma ação que já foi aplicada na tela (atualização otimista).
 * `prev` = estado antes da ação; `next` = depois.
 */
export async function persist(sb: SupabaseClient, userId: string, a: Action, prev: AppState, next: AppState): Promise<void> {
  switch (a.type) {
    case 'tx/add': {
      const t = a.tx
      check(await sb.rpc('add_transaction', { p_id: t.id, p_name: t.name, p_category: t.category, p_amount: t.amount, p_occurred_at: t.date, p_card_id: t.cardId, p_source: t.source ?? 'manual' }))
      return
    }
    case 'tx/update': {
      const t = a.tx
      check(await sb.rpc('update_transaction', { p_id: t.id, p_name: t.name, p_category: t.category, p_amount: t.amount, p_occurred_at: t.date, p_card_id: t.cardId }))
      return
    }
    case 'tx/delete':
      check(await sb.rpc('delete_transaction', { p_id: a.id }))
      return
    case 'tx/import': {
      // o arquivo fica guardado no storage; se o upload falhar, os lançamentos entram mesmo assim
      let uploadError: unknown = null
      if (a.file) await uploadInvoice(sb, userId, a.file).catch((e) => (uploadError = e))
      const items = a.txs.map((t) => ({ name: t.name, category: t.category, amount: t.amount, occurred_at: t.date }))
      check(await sb.rpc('import_invoice', { p_card_id: a.cardId, p_items: items }))
      if (uploadError) throw Object.assign(new Error('upload'), { code: 'upload' })
      return
    }
    case 'card/add':
      check(await sb.from('cards').insert({ id: a.card.id, user_id: userId, ...cardColumns(a.card) }))
      return
    case 'card/update': {
      const { id, ...rest } = a.card
      check(await sb.from('cards').update(cardColumns(rest)).eq('id', id))
      return
    }
    case 'card/delete':
      // o banco zera o card_id dos gastos (on delete set null): viram "Dinheiro / Pix"
      check(await sb.from('cards').delete().eq('id', a.id))
      return
    case 'goal/add': {
      // RPC: cria a meta e tira o "Já guardado" do saldo na mesma transação
      const g = a.goal
      check(await sb.rpc('add_goal', { p_id: g.id, p_name: g.name, p_target: g.target, p_saved: g.saved, p_due_month: toDueMonth(g.date), p_position: g.position ?? 0 }))
      return
    }
    case 'goal/update':
      check(await sb.from('goals').update({ name: a.goal.name, target: a.goal.target, due_month: toDueMonth(a.goal.date) }).eq('id', a.goal.id))
      return
    case 'goal/save':
      check(await sb.rpc('save_to_goal', { p_goal_id: a.id, p_amount: a.amount }))
      return
    case 'goal/delete':
      check(await sb.rpc('delete_goal', { p_goal_id: a.id }))
      return
    case 'goal/restore': {
      const g = a.goal
      check(await sb.rpc('restore_goal', { p_id: g.id, p_name: g.name, p_target: g.target, p_saved: g.saved, p_due_month: toDueMonth(g.date), p_position: g.position ?? a.index }))
      return
    }
    // Sem upsert: o "on conflict do update" do PostgREST reescreve também user_id/category,
    // e o banco só deixa atualizar as colunas de dados (grant por coluna). Então: atualiza; se não havia linha, insere.
    case 'budget/total': {
      const rows = check(await sb.from('budgets').update({ total: a.value }).eq('user_id', userId).select('user_id'))
      if (!rows?.length) check(await sb.from('budgets').insert({ user_id: userId, total: a.value }))
      return
    }
    case 'budget/category': {
      const rows = check(await sb.from('budget_categories').update({ amount: a.value }).eq('user_id', userId).eq('category', a.category).select('category'))
      if (!rows?.length) check(await sb.from('budget_categories').insert({ user_id: userId, category: a.category, amount: a.value }))
      return
    }
    case 'ui/hideBalance':
      if (prev.hideBalance !== next.hideBalance) check(await sb.from('profiles').update({ hide_balance: next.hideBalance }).eq('id', userId))
      return
    case 'ui/plus':
      if (prev.plus !== next.plus) check(await sb.from('profiles').update({ plus: next.plus }).eq('id', userId))
      return
    default:
      return
  }
}

/** Mensagem curta em PT-BR para um erro do banco. */
export function syncErrorMessage(e: unknown): string {
  const err = e as { code?: string; message?: string }
  if (err?.code === 'upload') return 'Lançamentos importados, mas o arquivo da fatura não foi salvo.'
  if (/JWT|session|Sessão obrigatória/i.test(err?.message ?? '')) return 'Sua sessão expirou. Entre de novo.'
  if (err?.code === '42501') return 'Sem permissão para essa alteração. Atualizamos seus dados.'
  if (err?.code === 'P0002') return 'Esse item não existe mais. Atualizamos seus dados.'
  if (err?.code === '23514' || err?.code === '22023') return 'Valor não aceito. Desfizemos a alteração.'
  if (/fetch|network|Failed/i.test(err?.message ?? '')) return 'Sem conexão. A alteração não foi salva.'
  return 'Não deu para salvar. Atualizamos seus dados.'
}

/** Mensagem curta em PT-BR para um erro do Supabase Auth. */
export function authErrorMessage(e: { message?: string; code?: string } | null): string {
  const m = `${e?.code ?? ''} ${e?.message ?? ''}`
  if (/invalid_credentials|Invalid login/i.test(m)) return 'E-mail ou senha incorretos.'
  if (/email_not_confirmed|not confirmed/i.test(m)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (/user_already_exists|already registered/i.test(m)) return 'Já existe uma conta com esse e-mail. Entre com a sua senha.'
  if (/weak_password|Password should/i.test(m)) return 'Senha fraca. Use pelo menos 6 caracteres.'
  if (/rate|too many/i.test(m)) return 'Muitas tentativas. Espere um minuto e tente de novo.'
  if (/fetch|network/i.test(m)) return 'Sem conexão. Verifique a internet.'
  return 'Não deu para entrar agora. Tente de novo.'
}
