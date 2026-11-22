# Eskgo — contexto do projeto

App de finanças pessoais (mobile-first, com versão desktop) feito no workshop do Lucas Marte.
Assinatura: "Seu assistente financeiro para grandes conquistas." Idioma do produto e das conversas: **PT-BR**.

- **Código:** `eskgo/` (rodar tudo de dentro dessa pasta)
- **Design (canvas):** https://claude.ai/artifact/112xfta7uRLdZg8SmkFoWK — 12 telas (mobile + desktop). Ao mudar uma tela no app, atualizar o canvas também.
- **Usuária(o) de exemplo:** Ventura (`ventura@eskgo.app`)

## Rodar

```bash
cd eskgo
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck + lint
npm run build
npm run storybook  # http://localhost:6006 (componentes + tokens)
```

## Produto (resumo do briefing)

Dois estágios, mesmo visual:
- **Estágio 1 (nativo):** tudo digitado à mão. Telas cheias: Home, Cartões, Metas. O resto é folha (sheet): Novo gasto, detalhe/editar gasto, novo/editar cartão, nova meta, guardar valor, teto do mês, Conta.
- **Estágio 2 (Plus):** Fatura (PDF/foto → lançamentos) e Assistente (chat), com OpenAI **no servidor**. Ativa em Avatar → Eskgo Plus.
- Sem menu de abas, sem sidebar, sem sino/busca. Desktop = a mesma home, mais larga.

## Stack

React 19 · TypeScript **5.9** · Vite 8 · Tailwind CSS v4 · ESLint 10.
- Vite no lugar de Next.js (pedido da pessoa).
- TypeScript ficou na 5.9 de propósito: o typescript-eslint ainda não suporta o TS 7.

## Estrutura (`eskgo/`)

```
src/
  index.css            tokens de design (@theme, prefixo esk-)
  config/env.ts        leitura tipada das variáveis VITE_*
  lib/                 store (reducer + ViewModel do mês), tipos, seed, formatação, navegação/folhas/toast (ui.tsx)
  services/ai/         contrato da IA · mock.ts (em uso) · http.ts (→ /api, futuro)
  services/storage.ts  persistência offline (localStorage, chave eskgo:state:v3)
  services/supabase.ts client do Supabase (liga sozinho com VITE_SUPABASE_* no .env)
  services/remote.ts   leitura do banco (loadSnapshot) e gravação por entidade/RPC (persist)
  components/          ui.tsx (primitivos), Icon, TopBar (barra fixa do desktop), TransactionRow
  screens/             Home, Cartoes, Metas, Fatura, Assistente, Login
  sheets/              AddExpenseSheet, OtherSheets (Conta, CardSheet, metas, teto)
api/                   Vercel Functions (vazia de propósito)
supabase/migrations/   6 migrations JÁ APLICADAS no Supabase (schema, RLS, funções, storage, seed demo, add_goal)
supabase/seed.sql      dados mock da demo (idempotente)
prisma/schema.prisma   só documentação (fonte da verdade = migrations SQL)
docs/banco/            README do banco (ER, policies, RPCs, mapeamento app ↔ colunas) + checklist.md
docs/integracao/       passo a passo + código de exemplo: openai.md, supabase.md
```

## Design system

- **Figma:** arquivo W5 (Community), coleções `Primitivos` (158) e `Semânticos` (183, aliases, kebab-case, modo Dark).
- **Docs:** `eskgo/docs/design-system/tokens.md` · dados em `eskgo/src/design-system/tokens.json` (alimenta o Storybook).
- **Storybook:** stories em `src/components/*.stories.tsx` e `src/design-system/Tokens.stories.tsx`.

## Design

Paleta trocada do briefing (lima/lilás) para **dourada**, a partir de uma referência da pessoa:

| Token | Cor | Uso |
|---|---|---|
| `esk-gold` | `#C9A452` | ação e progresso (botões, links, barras) |
| `esk-champagne` | `#E6D3A3` | cartões, avatar, IA/insight |
| `esk-bronze` | `#A8873F` | tom profundo |
| `esk-success` | `#3DBE5A` | só variação positiva |
| `esk-offwhite` | `#EFEBE1` | cartão claro |
| fundo / superfícies | `#030303` / `#111111` / `#18181B` | — |

Cartão de saldo: gradiente `#A8873F → #CFAE5E → #ECDDB0`. Texto sobre dourado/champanhe sempre `#0A0A0A` (contraste AA).
Fontes: Satoshi (Fontshare) + IBM Plex Mono nos kickers. Raios: card 34, carteira 32, tile 26, folha 36.
Breakpoints: `md` 800px (folhas viram diálogo, barra fixa aparece), `lg` 1100px (home em 2 colunas).

## Decisões já tomadas (não desfazer sem pedir)

- Atalho "Adicionar" virou **"Novo gasto"**. Atalhos usam container query para não cortar palavras com 4 itens.
- Cartão de saldo: título **"Saldo"**, sem a linha "Seu saldo".
- **Desktop:** barra fixa no topo (`TopBar`) com logo à esquerda (volta à Home) e perfil à direita; no celular não aparece.
- **Editar/excluir cartão:** toque no cartão da frente. Excluir mantém os gastos como "Dinheiro / Pix".
- **Dinheiro nas metas sai do saldo:** criar meta com "Já guardado" tira o valor do saldo (RPC `add_goal`), igual a "Guardar"; excluir devolve tudo.
- **Editar/excluir meta:** link "Editar meta" no card em destaque e na folha "Guardar em…". A edição muda nome, alvo e mês; o valor guardado só muda por "Guardar". Excluir devolve o valor guardado ao saldo e tem "Desfazer".
- **Fase atual:** app **ligado ao Supabase** (projeto `ajkipsvysdleovhlhtbu`, ESKGO-PROJECT, sa-east-1): login e cadastro reais, dados no banco, fatura no storage. IA ainda mock. Sem `VITE_SUPABASE_*` no `.env`, o app cai no modo offline (localStorage), útil para Storybook.
- **Como o app grava:** a ação aparece na tela na hora (reducer), vai para uma fila que grava no banco uma por vez, e depois o app relê tudo do banco. Erro = aviso + dados do banco de volta. Saldo e fatura só mudam por RPC.
- **Banco:** 6 tabelas (`profiles`, `cards`, `transactions`, `goals`, `budgets`, `budget_categories`), RLS só-dono, `anon` sem acesso, bucket privado `faturas` (pasta `{uid}/`). Operações que mexem no saldo passam por RPCs atômicas (`add/update/delete_transaction`, `import_invoice`, `add_goal`, `save_to_goal`, `delete_goal`, `restore_goal`, `monthly_spending`).
- **Dados mock** ficam no Supabase na conta demo `ventura@eskgo.app` (sem senha ainda) até a pessoa pedir para apagar. Agente do banco: `.claude/agents/supabase-architect.md`.

## Git / GitHub

- Repositório **público**: https://github.com/arthiventura/workshop (branch `main`). A raiz do Git é a pasta do workshop (inclui `CLAUDE.md`), não `eskgo/`. Na Vercel, o diretório do app é `eskgo`.
- Commits como "Ventura", com o e-mail noreply do GitHub (config só deste repositório).
- GitHub CLI instalado em `~/.local/bin/gh` (fora do PATH; chamar pelo caminho completo). Login feito na conta arthiventura.

## Segurança / ambiente

- `.env` local (não versionado, permissão 600) e `.env.example` documentado.
- `VITE_*` = público no navegador. Segredos (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) só no servidor.
- O `vite.config.ts` **bloqueia o build** se um segredo aparecer com prefixo `VITE_`.

## Pendências

Checklist completo: `eskgo/docs/banco/checklist.md`.

1. Definir a senha da conta demo no painel do Supabase (o CRUD logado já foi testado com uma conta real em 22/11).
2. Variáveis `VITE_SUPABASE_*` na Vercel + URL da Vercel em Auth → URL Configuration.
3. Antes de cobrar o Plus: `revoke update (plus)` em `profiles` e checar o Plus no servidor.
4. Ligar "Leaked Password Protection" no Auth (único aviso dos advisors).
5. Lint: só avisos de react-refresh (o erro da regex em `format.ts` foi corrigido).

Próximo passo combinado: refinar conforme o que o Lucas passar na aula.

## Jeito de trabalhar

- Conferir mudanças visuais no navegador em **celular (375px) e desktop (1440px)**.
- Manter app e canvas alinhados.
- Não fazer commit/push sem pedido.
