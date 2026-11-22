# Checklist · banco de dados Eskgo

`[x]` = executado e verificado no projeto `ESKGO-PROJECT` em 22/11/2026. `[ ]` = ainda falta.
Detalhes de cada item: [`README.md`](./README.md).

## Schema
- [x] Enums `expense_category`, `card_color`, `transaction_source`
- [x] Tabelas `profiles`, `cards`, `transactions`, `goals`, `budgets`, `budget_categories`
- [x] Ids `uuid` com `gen_random_uuid()`; dinheiro em `numeric(12,2)`; datas em `timestamptz`
- [x] `created_at` / `updated_at` em todas as tabelas (`updated_at` por trigger, testado)
- [x] FKs com `on delete cascade` para o dono; `transactions → cards` com FK composta `(card_id, user_id)` e `on delete set null (card_id)`
- [x] Check constraints (`last4`, `amount > 0`, `saved >= 0`, `invoice >= 0`, `due_day 1–31`, `due_month` = 1º dia, tamanhos de texto). Testado: `last4`, `amount` e `due_month`
- [x] Índices nas FKs e nas buscas por usuário/mês (`transactions (user_id, occurred_at desc)`)
- [x] Migrations pequenas e nomeadas, espelhadas em `supabase/migrations/` (md5 igual ao banco)
- [x] Rascunho `0001_schema_inicial.sql` removido

## RLS e grants
- [x] RLS habilitada nas 6 tabelas do `public`
- [x] Policies por operação com `(select auth.uid())`: 22 no total (`profiles` só select/update, de propósito)
- [x] `anon` sem nenhum grant em tabelas e RPCs (testado: `permission denied`)
- [x] `authenticated`: select/insert/delete + update só nas colunas de dados
- [x] `service_role` com CRUD (uso só no servidor)
- [x] Default privileges: objetos futuros no `public` não dão acesso ao `anon`
- [ ] Revogar `update (plus)` do `authenticated` quando o Plus virar pago

## Funções e triggers
- [x] `handle_new_user` `SECURITY DEFINER` + `search_path = ''` + trigger `on_auth_user_created` (testado: cria profile + budget)
- [x] `set_updated_at` + 6 triggers
- [x] 8 RPCs `SECURITY INVOKER`, `search_path = ''`, `EXECUTE` só para `authenticated`
- [x] `EXECUTE` das funções de trigger revogado de `public`, `anon` e `authenticated`

## Storage
- [x] Bucket privado `faturas` (15 MB; PDF, JPEG, PNG, WEBP, HEIC, HEIF)
- [x] 4 policies em `storage.objects` restringindo a `{auth.uid()}/...`
- [x] Testado por SQL: outro uid e anon não listam, não gravam, não movem e não apagam na pasta da demo
- [ ] Testar upload real pela Storage API (limite de 15 MB e MIME recusado) quando o app for ligado
- [x] Sem bucket de avatar (o app usa iniciais)

## Auth / conta demo
- [x] Conta `ventura@eskgo.app` criada (`auth.users` + `auth.identities` email, e-mail confirmado, sem senha)
- [x] Nenhuma outra conta permanente (contas de teste criadas e desfeitas dentro da transação)
- [ ] **Definir a senha da demo** (painel ou SQL Editor; ver README §8)
- [ ] Testar login real da demo depois de definir a senha
- [ ] Ativar "Leaked Password Protection" no painel (Auth → Settings), se o plano permitir
- [ ] Revisar no painel: confirmação de e-mail, URL do site e redirects (Auth → URL Configuration)

## Seed
- [x] Dados de `seed.ts` gravados na demo: 3 cartões, 22 gastos (12 no mês + 10 no anterior), 4 metas, teto + 5 categorias, saldo 14.500
- [x] Mês atual soma R$ 2.340 e anterior R$ 2.659 (conferido com `monthly_spending`)
- [x] `supabase/seed.sql` idempotente (rodado de novo: mesmos números, 1 usuário)
- [ ] Decidir se a migration de seed fica no histórico antes de produção (README §9)
- [ ] **Apagar ou trocar o mock antes de entrar dado real**

## CRUD validado (como dono)
- [x] `profiles`: C (trigger), R, U, D (cascata do Auth); insert/delete direto bloqueados
- [x] `cards`: C, R, U, D (gasto vira Dinheiro / Pix)
- [x] `transactions`: C, R, U, D
- [x] `goals`: C, R, U, D
- [x] `budgets`: C, R, U, D
- [x] `budget_categories`: C, R, U, D + upsert

## Testes negativos
- [x] Outro uid não lê os dados da demo (6 tabelas)
- [x] Outro uid não altera os dados da demo (6 tabelas)
- [x] Outro uid não apaga os dados da demo (6 tabelas)
- [x] Outro uid não insere com `user_id` da demo (6 tabelas)
- [x] Outro uid não liga gasto ao cartão da demo (FK composta) nem transfere gasto para a demo
- [x] Outro uid não usa as RPCs nos dados da demo
- [x] uuid aleatório e sessão sem `sub` não leem nada
- [x] `anon` não lê nada (tabelas) e não executa RPCs
- [x] Storage: um usuário não acessa a pasta de outro
- [x] Dados da demo idênticos (hash) depois de todos os ataques

## RPCs
- [x] `add_transaction`: saldo e fatura
- [x] `update_transaction`: troca de valor e de cartão
- [x] `delete_transaction`: saldo e fatura voltam
- [x] `import_invoice`: saldo, fatura = soma, `source = 'fatura'`; lista vazia recusada
- [x] `save_to_goal`: guardar, desfazer, não deixa negativo (atômico), valor 0 recusado
- [x] `delete_goal` + `restore_goal`: saldo volta e sai de novo; restore repetido não desconta
- [x] `monthly_spending`: 2.340 / 2.659

## Advisors
- [x] Segurança: rodado. Só "Leaked Password Protection" (config do Auth, fora do schema)
- [x] Performance: rodado, sem achados

## Prisma
- [x] `prisma/schema.prisma` espelhando o `public` (`@@map`/`@map`, `@db.Uuid`, `@db.Decimal(12, 2)`, `@db.Timestamptz`, relações, enums)
- [x] Nenhuma dependência adicionada
- [ ] `prisma validate` não foi rodado (o Prisma não está instalado, de propósito)

## Docs
- [x] `docs/banco/README.md` (visão geral, ER, tabelas, policies, RPCs, storage, mapeamento, env, mock)
- [x] `docs/integracao/supabase.md` atualizado
- [x] Comentários em `src/services/storage.ts` e `src/services/supabase.ts` apontam para as migrations novas
- [x] "Pendências" e estrutura do `CLAUDE.md` atualizadas

## Ligar o app

Código pronto em 22/11/2026: `src/services/supabase.ts` (client), `src/services/remote.ts` (leitura e gravação por entidade), `src/lib/store.tsx` (modo online com fila de gravações) e `src/screens/Login.tsx` (entrar e criar conta). Sem `VITE_SUPABASE_*` no `.env`, o app volta ao modo offline (localStorage).

- [x] `@supabase/supabase-js` instalado e client ativo em `src/services/supabase.ts`
- [x] `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (chave publishable) no `.env` local
- [x] Camada de dados por entidade: cada ação do reducer vira uma operação no banco (`persist` em `src/services/remote.ts`), aplicada na tela na hora e gravada numa fila, uma por vez
- [x] Depois de cada gravação o app relê tudo do banco (fonte da verdade); se der erro, mostra aviso e volta aos dados do banco
- [x] Saldo e fatura só mudam pelas RPCs (`add/update/delete_transaction`, `import_invoice`, `save_to_goal`, `delete_goal`, `restore_goal`)
- [x] Conversões: `due_day` ↔ `dueInDays`, `due_month` ↔ "Dez 2027", `monthly_spending` no lugar de `previousMonthTotal`, ids `crypto.randomUUID()`
- [x] Tela de login com Supabase Auth (`signInWithPassword`), sessão que sobrevive ao recarregar e "Sair" (`signOut`)
- [x] Tela de cadastro ("Criar conta": nome, e-mail, senha → `signUp` com `options.data.name`; aviso quando precisa confirmar o e-mail)
- [x] Upload da fatura para o bucket `faturas` (caminho `{uid}/{yyyy-mm}/{uuid}.ext`) ao confirmar a importação
- [x] "Restaurar dados de exemplo" escondido no modo online (a demo se restaura pelo `seed.sql`)
- [x] Typecheck, lint (0 erros) e build passando; tela de login conferida no navegador (375px)
- [x] Canvas: prancheta "Entrar / criar conta"
- [x] **Testado logado no navegador** (conta real nova, 22/11/2026), conferindo cada passo no banco:
  - cartão: criar (vencimento → `due_day`), editar (limite, cor), excluir (o gasto dele ficou como Dinheiro / Pix)
  - gasto: criar no cartão (saldo −, fatura +), editar valor e trocar para Pix (fatura volta a 0), apagar, apagar + Desfazer
  - meta: criar (com mês → `due_month`), Guardar R$ 500 (saldo −500), editar nome/alvo/mês, excluir (valor volta ao saldo), excluir + Desfazer (`restore_goal`)
  - teto do mês e teto por categoria (criar e alterar), ocultar saldo
  - recarregar a página: sessão, dados e "ocultar saldo" continuam; desktop 1440px ok
  - dados de teste apagados no fim; conta demo intacta
- [x] Cadastro de conta nova testado (cadastro → e-mail de confirmação → login; perfil criado pelo trigger)
- [x] Corrigido no teste: teto não salvava (403) porque o `upsert` reescrevia `user_id`; agora é update + insert
- [x] Regra das metas: criar com "Já guardado" tira do saldo (RPC `add_goal`, migration `20261122174845`); testado: saldo 0 → −300 ao criar → 0 ao excluir
- [ ] Testar upload real de fatura (Plus) e o limite de 15 MB pela Storage API
- [ ] `/api` (IA) conferindo `profiles.plus` no servidor
- [x] Deploy na Vercel: https://eskgo-seven.vercel.app (importado do GitHub, pasta `eskgo`); variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas
- [x] App publicado conferido (22/11/2026): abre na tela "Entrar" (modo online), sem erros no console; o bundle tem só a URL e a chave pública, nenhuma chave secreta
- [x] Supabase Auth → URL Configuration (conferido no painel em 22/11/2026): Site URL = `https://eskgo-seven.vercel.app`; Redirect URLs = `https://eskgo-seven.vercel.app` e `http://localhost:5173`
- [ ] Quando houver `/api`: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` na Vercel (só servidor)
- [ ] `supabase init` + `supabase link` para usar a CLI localmente
- [ ] Gerar tipos TypeScript do banco (`supabase gen types typescript`)
