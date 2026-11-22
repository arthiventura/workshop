# Integração · Supabase

O **banco já existe** no Supabase (`ESKGO-PROJECT`, `sa-east-1`), com RLS, RPCs, storage e a conta demo. A documentação completa está em [`docs/banco/README.md`](../banco/README.md), e o que falta está em [`docs/banco/checklist.md`](../banco/checklist.md).

**O app ainda não está ligado:** o estado vive em `localStorage` (`src/services/storage.ts`). Os passos abaixo fazem a troca.

1. Copiar **Project URL** e **anon/publishable key** (Supabase → Project Settings → API) para o `.env` e para a Vercel:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   A `service_role` só entra no servidor (`SUPABASE_SERVICE_ROLE_KEY`, sem `VITE_`).
2. O esquema **já está aplicado**: `supabase/migrations/*.sql`. Não é preciso rodar nada. Para outro ambiente: `supabase link` + `supabase db push`, e o seed em `supabase/seed.sql`.
3. `npm install @supabase/supabase-js` e descomentar o client em `src/services/supabase.ts`.
4. Trocar a persistência "estado inteiro" por **operações por entidade, assíncronas**. Cada action do reducer tem sua operação (tabela em `docs/banco/README.md` §7). Tudo que mexe em saldo ou fatura passa por RPC:
   `add_transaction`, `update_transaction`, `delete_transaction`, `import_invoice`, `save_to_goal`, `delete_goal`, `restore_goal`.
5. Converter os campos que mudaram (README §7):
   - `Card.dueInDays` ↔ `cards.due_day` (dia do mês)
   - `Goal.date` "Dez 2027" ↔ `goals.due_month` (`2027-12-01`)
   - `previousMonthTotal` → `rpc('monthly_spending', { p_months: 2 })`
   - `Card.limit` ↔ `cards.credit_limit`
   - ids: `uuid` (`crypto.randomUUID()` ou gerado pelo banco)
6. Login: ligar `src/screens/Login.tsx` em `supabase.auth.signInWithPassword`. Sair (folha Conta) → `supabase.auth.signOut()`. Falta a tela de cadastro (`supabase.auth.signUp`, com `options.data.name`; o trigger cria o perfil).
7. Fatura (estágio 2): enviar o arquivo para o bucket privado `faturas`, no caminho `{uid}/{yyyy-mm}/{uuid}.ext`.

## Mapa tipo → tabela

| `src/lib/types.ts` | Tabela |
|---|---|
| `User` + `balance`, `hideBalance`, `plus` | `profiles` (e-mail vem da sessão) |
| `Transaction` | `transactions` |
| `Card` | `cards` |
| `Goal` | `goals` |
| `Budget.total` | `budgets` |
| `Budget.byCategory` | `budget_categories` |

Todas as tabelas têm RLS: cada pessoa só lê e escreve as próprias linhas (`(select auth.uid()) = user_id`). O `anon` não acessa nada.
