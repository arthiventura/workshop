import type { AppState, Transaction } from './types'

/**
 * Dados de referência do briefing, tratados como se o Ventura tivesse digitado.
 * Mês atual: R$ 2.340 = Moradia 1.200 + Alimentação 744 + Transporte 240 + Lazer 156.
 * Tetos (R$ 3.200): Moradia 1.200 (100%) · Alimentação 1.200 (62%) · Transporte 600 (40%) · Lazer 200 (78%).
 */
function at(daysAgo: number, hour: number, minute = 0): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, hour, minute)
  // mantém tudo dentro do mês corrente, para "Este mês" fechar a conta
  return (d < monthStart ? monthStart : d).toISOString()
}

const tx = (
  id: string,
  name: string,
  category: Transaction['category'],
  cardId: string | null,
  amount: number,
  daysAgo: number,
  hour: number,
  minute = 0,
): Transaction => ({ id, name, category, cardId, amount, date: at(daysAgo, hour, minute), source: 'manual' })

export function createSeed(): AppState {
  return {
    version: 1,
    signedIn: true,
    user: { name: 'Ventura', email: 'ventura@eskgo.app' },
    balance: 14500,
    hideBalance: false,
    plus: false,
    previousMonthTotal: 2659,
    transactions: [
      tx('t1', 'Mercado', 'Alimentação', 'principal', 186.4, 0, 14, 20),
      tx('t2', 'Assinaturas', 'Lazer', 'salario', 64.8, 1, 9, 10),
      tx('t3', 'Uber', 'Transporte', 'principal', 32.9, 1, 8, 45),
      tx('t4', 'iFood', 'Alimentação', 'principal', 68.4, 2, 20, 30),
      tx('t5', 'Cinema', 'Lazer', 'principal', 56, 3, 19),
      tx('t6', 'Posto', 'Transporte', 'principal', 180, 5, 18, 10),
      tx('t7', 'Padaria', 'Alimentação', null, 32.2, 6, 8),
      tx('t8', 'Livraria', 'Lazer', 'viagem', 35.2, 8, 16),
      tx('t9', 'Mercado', 'Alimentação', 'principal', 297, 10, 11),
      tx('t10', 'Metrô', 'Transporte', null, 27.1, 12, 7, 50),
      tx('t11', 'Restaurante', 'Alimentação', 'salario', 160, 13, 21),
      tx('t12', 'Aluguel', 'Moradia', null, 1200, 16, 10),
    ],
    cards: [
      { id: 'principal', nickname: 'Principal', last4: '4552', color: 'gradient', limit: 3000, invoice: 1284, dueInDays: 8 },
      { id: 'salario', nickname: 'Salário', last4: '6917', color: 'champagne', limit: 2000, invoice: 640, dueInDays: 12 },
      { id: 'viagem', nickname: 'Viagem', last4: '1180', color: 'offwhite', limit: 1500, invoice: 98, dueInDays: 27 },
    ],
    goals: [
      { id: 'japao', name: 'Viagem ao Japão', target: 20000, saved: 13600, date: 'Dez 2027' },
      { id: 'reserva', name: 'Reserva', target: 10000, saved: 7200 },
      { id: 'curso', name: 'Curso', target: 3000, saved: 2700 },
      { id: 'carro', name: 'Carro novo', target: 40000, saved: 9600 },
    ],
    budget: {
      total: 3200,
      byCategory: { Moradia: 1200, Alimentação: 1200, Transporte: 600, Lazer: 200, Outros: 0 },
    },
  }
}
