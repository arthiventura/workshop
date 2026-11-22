# Integração · OpenAI (estágio 2)

A chave da OpenAI **só existe no servidor** (Vercel Functions em `/api`). O front nunca a vê.

```
Front (src/services/ai/http.ts) ──POST /api/*──▶ Vercel Function ──▶ api.openai.com
                                                  └─ lê OPENAI_API_KEY (sem VITE_)
```

## 1. Variáveis

`.env` local e Vercel → Settings → Environment Variables:

```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
VITE_AI_MODE=api
```

## 2. Helper compartilhado — `api/_lib/openai.ts`

```ts
// Pastas com "_" não viram rota na Vercel.
export async function openai(payload: Record<string, unknown>): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada')

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', ...payload }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)

  const json = await res.json()
  return (json.output ?? [])
    .filter((o: any) => o.type === 'message')
    .flatMap((o: any) => o.content ?? [])
    .filter((c: any) => c.type === 'output_text')
    .map((c: any) => c.text)
    .join('')
}
```

## 3. Chat do Assistente — `api/chat.ts`

```ts
import { openai } from './_lib/openai'

export async function POST(req: Request) {
  const { messages, context } = await req.json()

  const reply = await openai({
    instructions:
      'Você é o Assistente Eskgo. Responda em PT-BR, no máximo 3 frases. ' +
      'Comece pelo número em R$ e diga a consequência em uma linha. ' +
      'Use APENAS os dados abaixo (o dinheiro real da pessoa). Nada de dica genérica.\n\n' +
      JSON.stringify(context),
    input: messages.slice(-12),
  })

  return Response.json({ reply })
}
```

## 4. Leitura de fatura — `api/fatura.ts`

```ts
import { openai } from './_lib/openai'

const CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros']

export async function POST(req: Request) {
  const { fileName, mimeType, data } = await req.json() // data = base64
  const isPdf = mimeType === 'application/pdf'

  const file = isPdf
    ? { type: 'input_file', filename: fileName, file_data: `data:application/pdf;base64,${data}` }
    : { type: 'input_image', image_url: `data:${mimeType};base64,${data}` }

  const text = await openai({
    instructions:
      'Extraia cada compra da fatura de cartão: nome curto, categoria, valor em reais, data yyyy-mm-dd. ' +
      'subscription=true para serviços recorrentes. Ignore pagamentos, estornos, juros e IOF.',
    input: [{ role: 'user', content: [{ type: 'input_text', text: 'Extraia as compras.' }, file] }],
    text: {
      format: {
        type: 'json_schema',
        name: 'fatura',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['purchases', 'total'],
          properties: {
            total: { type: 'number' },
            purchases: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'category', 'amount', 'date', 'subscription'],
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string', enum: CATEGORIES },
                  amount: { type: 'number' },
                  date: { type: 'string' },
                  subscription: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  })

  return Response.json({ ...JSON.parse(text), mode: 'openai' })
}
```

## 5. Insight em Metas — `api/insight.ts`

Mesmo padrão do chat, pedindo JSON `{ context, number, consequence }` via `text.format` (json_schema).
Ex.: `{ "context": "assinatura", "number": "+ R$ 320", "consequence": "Cancelando 2 assinaturas, a viagem chega 3 meses antes." }`

## Contrato

Tipos de entrada/saída em `src/services/ai/types.ts`. O mock (`src/services/ai/mock.ts`) devolve exatamente o mesmo formato,
então trocar `VITE_AI_MODE=mock` → `api` não muda nenhuma tela.

## Limites e cuidados

- Body da Vercel Function: ~4,5 MB. PDFs maiores → subir no Supabase Storage e mandar só a URL assinada.
- Validar tamanho e tipo do arquivo no servidor também (não só no front).
- Exigir usuário autenticado (JWT do Supabase no header `Authorization`) antes de chamar a OpenAI.
