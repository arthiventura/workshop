-- Eskgo · 2/5 · RLS, policies e grants
-- Regra: cada pessoa só enxerga e altera as próprias linhas. anon não acessa nada.

alter table public.profiles          enable row level security;
alter table public.cards             enable row level security;
alter table public.transactions      enable row level security;
alter table public.goals             enable row level security;
alter table public.budgets           enable row level security;
alter table public.budget_categories enable row level security;

-- ───────── profiles: só ler e alterar (insert = trigger; delete = cascata de auth.users) ─────────
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ───────── cards ─────────
create policy cards_select_own on public.cards
  for select to authenticated using ((select auth.uid()) = user_id);
create policy cards_insert_own on public.cards
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy cards_update_own on public.cards
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy cards_delete_own on public.cards
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────── transactions ─────────
create policy transactions_select_own on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy transactions_insert_own on public.transactions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy transactions_update_own on public.transactions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transactions_delete_own on public.transactions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────── goals ─────────
create policy goals_select_own on public.goals
  for select to authenticated using ((select auth.uid()) = user_id);
create policy goals_insert_own on public.goals
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy goals_update_own on public.goals
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy goals_delete_own on public.goals
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────── budgets ─────────
create policy budgets_select_own on public.budgets
  for select to authenticated using ((select auth.uid()) = user_id);
create policy budgets_insert_own on public.budgets
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy budgets_update_own on public.budgets
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy budgets_delete_own on public.budgets
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────── budget_categories ─────────
create policy budget_categories_select_own on public.budget_categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy budget_categories_insert_own on public.budget_categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy budget_categories_update_own on public.budget_categories
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy budget_categories_delete_own on public.budget_categories
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────── grants mínimos ─────────
revoke all on table public.profiles, public.cards, public.transactions, public.goals,
  public.budgets, public.budget_categories from anon, authenticated, service_role;

-- profiles: ler; alterar só as colunas do app (id e datas ficam de fora)
grant select on table public.profiles to authenticated;
grant update (name, balance, hide_balance, plus) on table public.profiles to authenticated;

-- demais tabelas: CRUD; no UPDATE, id/user_id/created_at/updated_at ficam de fora
grant select, insert, delete on table public.cards, public.transactions, public.goals,
  public.budgets, public.budget_categories to authenticated;
grant update (nickname, last4, color, credit_limit, invoice, due_day) on table public.cards to authenticated;
grant update (card_id, name, category, amount, occurred_at, source) on table public.transactions to authenticated;
grant update (name, target, saved, due_month, position) on table public.goals to authenticated;
grant update (total) on table public.budgets to authenticated;
grant update (category, amount) on table public.budget_categories to authenticated;

-- service_role (só servidor, ignora RLS): usado por /api e tarefas administrativas
grant select, insert, update, delete on table public.profiles, public.cards, public.transactions,
  public.goals, public.budgets, public.budget_categories to service_role;

-- objetos criados no futuro no public não ganham acesso de anon por padrão
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke execute on functions from anon, public;
