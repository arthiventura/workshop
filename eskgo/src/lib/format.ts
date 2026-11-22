const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const int = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** R$ 1.284,50 */
export const money = (v: number) => brl.format(v).replace(/\u00a0/g, ' ')

/** R$ 1.284 (sem centavos quando inteiro) */
export const moneyShort = (v: number) => (Math.round(v * 100) % 100 === 0 ? `R$ ${int.format(Math.round(v))}` : money(v))

/** Separa "R$ 14.500" e ",00" para o número grande do hero. */
export function splitMoney(v: number) {
  const full = money(v)
  const i = full.lastIndexOf(',')
  return { main: full.slice(0, i), cents: full.slice(i) }
}

/** "86,90" | "1.234,5" | "12" → número; inválido → null */
export function parseMoney(input: string): number | null {
  const clean = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  if (!clean) return null
  const n = Number(clean)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

/** 86.9 → "86,90" para preencher inputs */
export const toInput = (v: number) => v.toFixed(2).replace('.', ',')

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export const monthName = (d = new Date()) => MONTHS_LONG[d.getMonth()]
export const prevMonthName = (d = new Date()) => MONTHS_LONG[(d.getMonth() + 11) % 12]

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "Hoje, 14:20" · "Ontem" · "12 nov" */
export function relativeDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const hh = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (sameDay(d, now)) return `Hoje, ${hh}`
  if (sameDay(d, yesterday)) return 'Ontem'
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** yyyy-mm-dd no fuso local, para <input type="date"> */
export function toDateInput(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function fromDateInput(value: string, keepTimeFrom?: string) {
  const [y, m, day] = value.split('-').map(Number)
  const base = keepTimeFrom ? new Date(keepTimeFrom) : new Date()
  return new Date(y, m - 1, day, base.getHours(), base.getMinutes()).toISOString()
}

export const pct = (part: number, whole: number) => (whole <= 0 ? 0 : Math.round((part / whole) * 100))

/** Id novo. uuid de verdade, porque no Supabase todo id é uuid (e o app cria o id antes de gravar). */
export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10)

/* ───────── Mês da meta: "Dez 2027" (app) ↔ "2027-12" (input) ↔ "2027-12-01" (banco) ───────── */
const MONTHS_CAP = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** "2027-12" (ou "2027-12-01") → "Dez 2027" */
export const monthToLabel = (value: string) => {
  const [y, m] = value.split('-').map(Number)
  return MONTHS_CAP[m - 1] ? `${MONTHS_CAP[m - 1]} ${y}` : undefined
}

/** "Dez 2027" → "2027-12" (valor do <input type="month">) */
export const labelToMonth = (label?: string) => {
  const [mon, y] = label?.split(' ') ?? []
  const i = MONTHS_CAP.indexOf(mon)
  return i >= 0 && /^\d{4}$/.test(y ?? '') ? `${y}-${String(i + 1).padStart(2, '0')}` : ''
}

/* ───────── Vencimento do cartão: dia do mês (banco) ↔ "vence em X dias" (app) ───────── */

/** Dias até o próximo vencimento, a partir do dia do mês (1–31). Dia 31 vira o último dia em meses curtos. */
export function dueInDays(dueDay: number, today = new Date()): number {
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  const dayIn = (yy: number, mm: number) => Math.min(dueDay, new Date(yy, mm + 1, 0).getDate())
  let due = new Date(y, m, dayIn(y, m))
  if (d > due.getDate()) due = new Date(y, m + 1, dayIn(y, m + 1))
  return Math.round((due.getTime() - new Date(y, m, d).getTime()) / 86_400_000)
}

/** "Vence em X dias" → dia do mês do vencimento */
export const dueDayFromDays = (days: number, today = new Date()) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days).getDate()
