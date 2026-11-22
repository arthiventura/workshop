# Integração · Supabase

Hoje o estado vive em `localStorage` (`src/services/storage.ts`). Os passos abaixo trocam por Supabase sem mexer nas telas.

1. Criar o projeto no Supabase e copiar **Project URL** e **anon key** para `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
2. Rodar `supabase/migrations/0001_schema_inicial.sql` (SQL Editor ou `supabase db push`).
3. `npm install @supabase/supabase-js` e descomentar o client em `src/services/supabase.ts`.
4. Implementar um `StateStorage` com Supabase em `src/services/storage.ts` (ou trocar o reducer por chamadas por entidade).
5. Login: a tela `src/screens/Login.tsx` já tem e-mail + senha validados — ligar em `supabase.auth.signInWithPassword`.
   Sair (folha Conta) → `supabase.auth.signOut()`.

## Mapa tipo → tabela

| `src/lib/types.ts` | Tabela          |
|--------------------|-----------------|
| `User`             | `profiles`      |
| `Transaction`      | `transactions`  |
| `Card`             | `cards`         |
| `Goal`             | `goals`         |
| `Budget`           | `budgets`       |

Todas as tabelas têm RLS: cada pessoa só lê e escreve as próprias linhas (`user_id = auth.uid()`).
