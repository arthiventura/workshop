import { env } from '../../config/env'
import { httpAI } from './http'
import { mockAI } from './mock'

export * from './types'

/** Troca de implementação por env: VITE_AI_MODE=mock (padrão) | api */
export const ai = env.aiMode === 'api' ? httpAI : mockAI

export const readInvoice = ai.readInvoice
export const fetchInsight = ai.fetchInsight
export const askAssistant = ai.askAssistant
