# /api — Vercel Functions (estágio 2)

Pasta reservada para o backend serverless. **Ainda vazia de propósito**: hoje o front usa a IA em modo `mock`.

A Vercel transforma cada arquivo `.ts` desta pasta em uma rota. Ao integrar, crie:

| Arquivo          | Rota              | Faz                                              |
|------------------|-------------------|--------------------------------------------------|
| `api/fatura.ts`  | `POST /api/fatura`  | PDF ou foto → compras extraídas (OpenAI visão)  |
| `api/insight.ts` | `POST /api/insight` | contexto do app → 1 insight                     |
| `api/chat.ts`    | `POST /api/chat`    | conversa + contexto → resposta do Assistente    |

Código de exemplo pronto para copiar: [`docs/integracao/openai.md`](../docs/integracao/openai.md).
Contrato de entrada/saída: `src/services/ai/types.ts` (o front já chama essas rotas em `src/services/ai/http.ts`).

Depois de criar as Functions: `VITE_AI_MODE=api` no `.env` e na Vercel.

> Arquivos ou pastas que começam com `_` aqui dentro não viram rota (bom para helpers, ex.: `api/_lib/openai.ts`).
