/**
 * IA real (estágio 2) — chama as Vercel Functions em /api, que falam com a OpenAI.
 * A chave da OpenAI fica só no servidor. Ativar com VITE_AI_MODE=api quando /api existir.
 * Contrato das rotas: docs/integracao/openai.md
 */
import { env } from '../../config/env'
import { buildContext, type AIService, type InvoiceResult, type Insight } from './types'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `Erro ${res.status}`)
  return res.json() as Promise<T>
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export const httpAI: AIService = {
  async readInvoice(file) {
    const data = await toBase64(file)
    return post<InvoiceResult>('/fatura', { fileName: file.name, mimeType: file.type, data })
  },
  fetchInsight: (state) => post<Insight>('/insight', { context: buildContext(state) }),
  askAssistant: (messages, state) => post<{ reply: string }>('/chat', { messages, context: buildContext(state) }),
}
