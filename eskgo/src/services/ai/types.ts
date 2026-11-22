import type { AppState, Category } from '../../lib/types'

export interface ParsedPurchase {
  name: string
  category: Category
  amount: number
  /** yyyy-mm-dd */
  date: string
  subscription: boolean
}

export interface InvoiceResult {
  purchases: ParsedPurchase[]
  total: number
  mode: 'openai' | 'demo'
}

/** Anatomia de um insight: contexto · número em destaque · consequência em uma linha */
export interface Insight {
  context: string
  number: string
  consequence: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Contrato da IA. O mock e a implementação real (via /api) seguem o mesmo formato. */
export interface AIService {
  readInvoice(file: File): Promise<InvoiceResult>
  fetchInsight(state: AppState): Promise<Insight>
  askAssistant(messages: ChatMessage[], state: AppState): Promise<{ reply: string }>
}

/** Resumo enxuto do app que vai como contexto para a IA (sem dados sensíveis de cartão). */
export function buildContext(s: AppState) {
  const now = new Date()
  const month = s.transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  return {
    user: s.user.name,
    hoje: now.toISOString().slice(0, 10),
    saldo: s.balance,
    tetoDoMes: s.budget.total,
    tetosPorCategoria: s.budget.byCategory,
    gastosDoMes: month.map((t) => ({ nome: t.name, categoria: t.category, valor: t.amount, data: t.date.slice(0, 10) })),
    mesAnteriorTotal: s.previousMonthTotal,
    cartoes: s.cards.map((c) => ({ apelido: c.nickname, fatura: c.invoice, limite: c.limit, venceEmDias: c.dueInDays })),
    metas: s.goals.map((g) => ({ nome: g.name, alvo: g.target, guardado: g.saved, data: g.date ?? null })),
  }
}
export type AppContext = ReturnType<typeof buildContext>
