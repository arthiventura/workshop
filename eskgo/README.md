# Eskgo

Seu assistente financeiro para grandes conquistas. Mobile-first, com a mesma home mais larga no desktop.

> **Fase atual: só front-end.** Sem backend e sem chamadas de rede — a IA do Plus roda em modo `mock`
> e os dados ficam no `localStorage`. Tudo está preparado para ligar Supabase, OpenAI e Vercel depois.

## Rodar

```bash
cp .env.example .env   # já existe um .env local; use só se precisar recriar
npm install
npm run dev            # http://localhost:5173
```

`npm run build` → typecheck + build de produção em `dist/`.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (tokens em `src/index.css`, prefixo `esk-`).
Depois: Supabase (auth + banco) · Vercel (hosting + Functions) · OpenAI (estágio 2).

## Estrutura

```
.
├── api/                      Vercel Functions (vazia por enquanto — ver api/README.md)
├── docs/integracao/          Passo a passo + código de exemplo: openai.md, supabase.md
├── public/                   Arquivos estáticos (favicon)
├── supabase/migrations/      Esquema do banco com RLS (rascunho, não aplicado)
├── src/
│   ├── config/env.ts         Leitura tipada das variáveis VITE_*
│   ├── services/
│   │   ├── ai/               Contrato da IA · mock.ts (hoje) · http.ts (→ /api)
│   │   ├── storage.ts        Persistência (localStorage hoje → Supabase depois)
│   │   └── supabase.ts       Client do Supabase (comentado até a integração)
│   ├── lib/                  Estado (store), tipos, seed, formatação, navegação/folhas
│   ├── components/           Primitivos de UI (botões, folha, progresso, ícones)
│   ├── screens/              Home · Cartões · Metas · Fatura* · Assistente* · Login
│   ├── sheets/               Adicionar gasto · Conta · Novo cartão · Nova meta · Guardar · Teto
│   └── index.css             Design tokens
├── .env                      Local, NÃO versionado (permissão 600)
├── .env.example              Modelo documentado — este vai para o GitHub
└── vercel.json               Build, rewrites e headers de segurança
```

\* só no Plus (Avatar → Eskgo Plus).

## Variáveis de ambiente

| Variável                    | Onde       | Uso                                   |
|-----------------------------|------------|---------------------------------------|
| `VITE_APP_NAME`, `VITE_APP_URL` | front  | Nome e URL do app                     |
| `VITE_SUPABASE_URL`         | front      | URL do projeto Supabase               |
| `VITE_SUPABASE_ANON_KEY`    | front      | Chave pública (protegida por RLS)     |
| `VITE_AI_MODE`              | front      | `mock` (hoje) ou `api`                |
| `VITE_API_BASE_URL`         | front      | Base das Functions (`/api`)           |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | servidor | OpenAI nas Functions               |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | servidor | Tarefas de servidor        |

**Segurança:** tudo com `VITE_` vai para o navegador. O `vite.config.ts` **bloqueia o build** se alguém
criar `VITE_OPENAI_*`, `VITE_*SERVICE_ROLE*`, `VITE_*SECRET*` etc. O `.env` (e qualquer `.env.*`, exceto o
`.env.example`) está no `.gitignore`.

## Próximos passos de integração

1. **GitHub:** `git init`, primeiro commit, repositório privado.
2. **Vercel:** importar o repositório; cadastrar as variáveis do `.env.example`.
3. **Supabase:** `docs/integracao/supabase.md`.
4. **OpenAI (Plus):** `docs/integracao/openai.md` → criar `api/*.ts` e usar `VITE_AI_MODE=api`.
