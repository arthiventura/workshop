/**
 * IA em modo demo — roda 100% no navegador, sem rede.
 * Calcula com os dados reais do app, para a interface se comportar como vai se comportar com a OpenAI.
 */
import type { Category } from '../../lib/types'
import { buildContext, type AIService, type AppContext, type InvoiceResult, type ParsedPurchase } from './types'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })

const DELIVERY = /ifood|rappi|delivery|uber eats|z[eé] delivery/i
const SUBS = /assinatura|netflix|spotify|prime|youtube|icloud|academia|disney|hbo|max/i

export const mockAI: AIService = {
  async readInvoice(file) {
    if (!file.size) throw new Error('Arquivo vazio.')
    await wait(2400)
    return demoInvoice()
  },
  async fetchInsight(state) {
    await wait(600)
    return demoInsight(buildContext(state))
  },
  async askAssistant(messages, state) {
    await wait(900)
    return { reply: demoReply(messages.at(-1)?.content ?? '', buildContext(state)) }
  },
}

/* ───────── fatura: 34 compras · 6 assinaturas · R$ 1.284 ───────── */

function demoInvoice(): InvoiceResult {
  const now = new Date()
  const day = (d: number) => {
    const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(d, now.getDate())))
    const p = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
  }
  const subs: [string, number][] = [
    ['Netflix', 55.9], ['Spotify', 21.9], ['Academia', 99], ['iCloud', 14.9], ['Amazon Prime', 19.9], ['YouTube Premium', 24.9],
  ]
  const buys: [string, Category, number][] = [
    ['iFood', 'Alimentação', 68.4], ['Pão de Açúcar', 'Alimentação', 342.15], ['Posto Shell', 'Transporte', 210],
    ['Uber', 'Transporte', 24.6], ['iFood', 'Alimentação', 52.9], ['Drogasil', 'Outros', 47.8],
    ['Uber', 'Transporte', 18.3], ['Padaria Real', 'Alimentação', 23.5], ['Rappi', 'Alimentação', 39.9],
    ['Cinemark', 'Lazer', 44], ['99', 'Transporte', 15.7], ['Hortifruti', 'Alimentação', 31.2],
    ['iFood', 'Alimentação', 47.3], ['Livraria Cultura', 'Lazer', 59.9], ['Estacionamento', 'Transporte', 18],
    ['Café', 'Alimentação', 12.5], ['Uber', 'Transporte', 21.4], ['Renner', 'Outros', 89.9],
    ['iFood', 'Alimentação', 58.6], ['Farmácia', 'Outros', 22.4], ['Sorveteria', 'Lazer', 16],
    ['Uber', 'Transporte', 16.9], ['Mercado Extra', 'Alimentação', 0], ['Pet shop', 'Outros', 64.5],
    ['Bar do Zé', 'Lazer', 72], ['Lavanderia', 'Moradia', 35], ['Kalunga', 'Outros', 19.9], ['iFood', 'Alimentação', 44.2],
  ]
  const total = 1284
  const subsTotal = subs.reduce((s, [, v]) => s + v, 0)
  const partial = buys.reduce((s, [, , v]) => s + v, 0)
  buys[22][2] = Math.round((total - subsTotal - partial) * 100) / 100 // fecha a fatura em R$ 1.284

  const purchases: ParsedPurchase[] = [
    ...subs.map(([name, amount], i) => ({ name, category: (name === 'Academia' ? 'Outros' : 'Lazer') as Category, amount, date: day(3 + i), subscription: true })),
    ...buys.map(([name, category, amount], i) => ({ name, category, amount, date: day(1 + ((i * 7) % 28)), subscription: false })),
  ]
  return { purchases, total, mode: 'demo' }
}

/* ───────── insight e chat ───────── */

function sumWhere(ctx: AppContext, re: RegExp) {
  return ctx.gastosDoMes.filter((g) => re.test(g.nome)).reduce((s, g) => s + g.valor, 0)
}

function monthsUntil(label?: string | null) {
  if (!label) return null
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const [m, y] = label.toLowerCase().split(' ')
  const idx = months.indexOf(m.slice(0, 3))
  if (idx < 0 || !y) return null
  const now = new Date()
  return (Number(y) - now.getFullYear()) * 12 + (idx - now.getMonth())
}

function goalPlan(ctx: AppContext, extraPerMonth: number) {
  const goal = ctx.metas[0]
  if (!goal) return null
  const missing = Math.max(0, goal.alvo - goal.guardado)
  const months = monthsUntil(goal.data) ?? 12
  const monthly = months > 0 ? missing / months : missing
  const faster = monthly + extraPerMonth > 0 ? Math.ceil(missing / (monthly + extraPerMonth)) : months
  return { goal, missing, monthly, earlier: Math.max(0, months - faster) }
}

const meses = (n: number) => `${n} ${n === 1 ? 'mês' : 'meses'}`

function demoInsight(ctx: AppContext) {
  const subs = sumWhere(ctx, SUBS)
  const delivery = sumWhere(ctx, DELIVERY)
  if (subs > 0) {
    const yearly = Math.round(subs * 0.4 * 12) // cancelar ~2 das assinaturas
    const plan = goalPlan(ctx, yearly / 12)
    return {
      context: 'assinatura',
      number: `+ ${brl(yearly)}`,
      consequence: `Cancelando 2 assinaturas, você guarda ${brl(yearly)} por ano${plan && plan.earlier > 0 ? ` e ${plan.goal.nome} chega ${meses(plan.earlier)} antes` : ''}.`,
    }
  }
  if (delivery > 0) {
    const half = Math.round(delivery / 2)
    return { context: 'gasto', number: `+ ${brl(half)}/mês`, consequence: `Reduzindo o delivery pela metade, sobram ${brl(half)} por mês para as metas.` }
  }
  const remaining = ctx.tetoDoMes - ctx.gastosDoMes.reduce((s, g) => s + g.valor, 0)
  return { context: 'gasto', number: brl(Math.max(0, remaining)), consequence: 'É o que ainda cabe no teto do mês. Guardando metade, a meta principal anda mais rápido.' }
}

function demoReply(q: string, ctx: AppContext): string {
  const t = q.toLowerCase()
  const month = ctx.gastosDoMes
  const total = month.reduce((s, g) => s + g.valor, 0)

  if (/delivery|ifood|rappi|pedido/.test(t)) {
    const d = sumWhere(ctx, DELIVERY)
    const n = month.filter((g) => DELIVERY.test(g.nome)).length
    if (!d) return 'R$ 0 em delivery neste mês. Nenhum lançamento de iFood ou Rappi até agora.'
    return `${brl(d)} em delivery neste mês, em ${n} ${n === 1 ? 'pedido' : 'pedidos'}. É ${Math.round((d / total) * 100)}% de tudo que saiu.`
  }
  if (/viagem|jap[aã]o|guardar|guardo|meta|juntar/.test(t)) {
    const extra = Math.max(120, Math.round(sumWhere(ctx, DELIVERY) / 2))
    const plan = goalPlan(ctx, extra)
    if (!plan) return 'Você ainda não tem uma meta. Crie uma em Metas e eu calculo o ritmo.'
    return `+ ${brl(extra)}/mês. Faltam ${brl(plan.missing)} para ${plan.goal.nome}; no ritmo atual são ${brl(Math.round(plan.monthly))} por mês. Somando ${brl(extra)} por mês, ela chega ${meses(plan.earlier)} antes.`
  }
  if (/assinatura|cancel/.test(t)) {
    const list = month.filter((g) => SUBS.test(g.nome))
    if (!list.length) return 'Nenhuma assinatura identificada nos lançamentos deste mês. Importe a fatura para eu procurar.'
    const s = list.reduce((a, g) => a + g.valor, 0)
    return `${brl(s)} por mês em assinaturas: ${list.map((g) => `${g.nome} (${brl(g.valor)})`).join(', ')}. Cancelar as duas menores devolve ${brl(Math.round(s * 0.4 * 12))} por ano.`
  }
  if (/saldo|tenho|sobra/.test(t)) return `${brl(ctx.saldo)} de saldo agora. Ainda cabem ${brl(Math.max(0, ctx.tetoDoMes - total))} no teto do mês.`
  if (/azul|fecho|fechar|teto|m[eê]s/.test(t)) {
    const left = ctx.tetoDoMes - total
    return left >= 0
      ? `Sim: ${brl(left)} ainda cabem no teto de ${brl(ctx.tetoDoMes)}. Mantendo o ritmo, você fecha o mês no azul.`
      : `Não: o mês já passou ${brl(-left)} do teto de ${brl(ctx.tetoDoMes)}.`
  }
  const byCat: Record<string, number> = {}
  for (const g of month) byCat[g.categoria] = (byCat[g.categoria] ?? 0) + g.valor
  const [topCat, topVal] = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0] ?? ['—', 0]
  return `${brl(total)} gastos neste mês. A maior fatia é ${topCat}, com ${brl(topVal)}. Pergunte sobre delivery, assinaturas ou a sua meta.`
}
