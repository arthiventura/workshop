export const CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros'] as const
export type Category = (typeof CATEGORIES)[number]

/** Uma compra digitada (estágio 1) ou importada da fatura (estágio 2). */
export interface Transaction {
  id: string
  name: string
  category: Category
  /** null = dinheiro / pix */
  cardId: string | null
  /** ISO date-time */
  date: string
  /** valor positivo; exibido sempre com "−" */
  amount: number
  source?: 'manual' | 'fatura'
}

export type CardColor = 'gradient' | 'champagne' | 'offwhite'

export interface Card {
  id: string
  nickname: string
  last4: string
  color: CardColor
  limit: number
  /** fatura atual */
  invoice: number
  dueInDays: number
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  /** "Dez 2027" */
  date?: string
  /** ordem na tela (vem do banco; no modo offline é a ordem do array) */
  position?: number
}

export interface Budget {
  /** teto do mês */
  total: number
  byCategory: Record<Category, number>
}

export interface User {
  name: string
  email: string
}

export interface AppState {
  version: 1
  signedIn: boolean
  user: User
  balance: number
  hideBalance: boolean
  /** Estágio 2 ativo (Fatura + Assistente via OpenAI) */
  plus: boolean
  previousMonthTotal: number
  transactions: Transaction[]
  cards: Card[]
  goals: Goal[]
  budget: Budget
}
