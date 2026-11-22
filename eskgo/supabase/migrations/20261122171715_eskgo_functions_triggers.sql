-- Eskgo · 3/5 · funções, triggers e RPCs
-- Toda função tem search_path = '' e nomes qualificados.
-- RPCs: SECURITY INVOKER (respeitam a RLS de quem chama) e EXECUTE só para authenticated.

-- ───────── updated_at ─────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at          before update on public.profiles          for each row execute function public.set_updated_at();
create trigger cards_set_updated_at             before update on public.cards             for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at      before update on public.transactions      for each row execute function public.set_updated_at();
create trigger goals_set_updated_at             before update on public.goals             for each row execute function public.set_updated_at();
create trigger budgets_set_updated_at           before update on public.budgets           for each row execute function public.set_updated_at();
create trigger budget_categories_set_updated_at before update on public.budget_categories for each row execute function public.set_updated_at();

-- ───────── cadastro: cria perfil + teto quando nasce um usuário no Auth ─────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1)), 80)
  )
  on conflict (id) do nothing;

  insert into public.budgets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── RPC: novo gasto (gasto + saldo + fatura do cartão) ─────────
create or replace function public.add_transaction(
  p_name        text,
  p_category    public.expense_category,
  p_amount      numeric,
  p_occurred_at timestamptz default null,
  p_card_id     uuid default null,
  p_source      public.transaction_source default 'manual',
  p_id          uuid default null
)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tx  public.transactions;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;

  insert into public.transactions (id, user_id, card_id, name, category, amount, occurred_at, source)
  values (coalesce(p_id, gen_random_uuid()), v_uid, p_card_id, p_name, p_category, p_amount,
          coalesce(p_occurred_at, now()), coalesce(p_source, 'manual'))
  returning * into v_tx;

  update public.profiles set balance = balance - v_tx.amount where id = v_uid;
  if not found then
    raise exception 'Perfil não encontrado' using errcode = 'P0002';
  end if;

  if v_tx.card_id is not null then
    update public.cards set invoice = invoice + v_tx.amount where id = v_tx.card_id and user_id = v_uid;
  end if;

  return v_tx;
end;
$$;

-- ───────── RPC: editar gasto (desfaz o antigo, aplica o novo) ─────────
create or replace function public.update_transaction(
  p_id          uuid,
  p_name        text,
  p_category    public.expense_category,
  p_amount      numeric,
  p_occurred_at timestamptz,
  p_card_id     uuid default null
)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_old public.transactions;
  v_new public.transactions;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;

  select * into v_old from public.transactions where id = p_id for update;
  if not found then
    raise exception 'Gasto não encontrado' using errcode = 'P0002';
  end if;

  update public.transactions
     set name = p_name, category = p_category, amount = p_amount,
         occurred_at = coalesce(p_occurred_at, occurred_at), card_id = p_card_id
   where id = p_id
  returning * into v_new;

  update public.profiles set balance = balance + v_old.amount - v_new.amount where id = v_uid;

  if v_old.card_id is not null then
    update public.cards set invoice = greatest(0, invoice - v_old.amount) where id = v_old.card_id and user_id = v_uid;
  end if;
  if v_new.card_id is not null then
    update public.cards set invoice = invoice + v_new.amount where id = v_new.card_id and user_id = v_uid;
  end if;

  return v_new;
end;
$$;

-- ───────── RPC: excluir gasto (devolve ao saldo e tira da fatura) ─────────
create or replace function public.delete_transaction(p_id uuid)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_old public.transactions;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;

  delete from public.transactions where id = p_id returning * into v_old;
  if not found then
    raise exception 'Gasto não encontrado' using errcode = 'P0002';
  end if;

  update public.profiles set balance = balance + v_old.amount where id = v_uid;
  if v_old.card_id is not null then
    update public.cards set invoice = greatest(0, invoice - v_old.amount) where id = v_old.card_id and user_id = v_uid;
  end if;

  return v_old;
end;
$$;

-- ───────── RPC: importar fatura (estágio 2) ─────────
-- p_items: [{ "name": "...", "category": "Alimentação", "amount": 12.5, "occurred_at": "2026-11-03T15:00:00Z" }, ...]
-- Igual ao reducer tx/import: tira a soma do saldo e a fatura do cartão passa a ser a soma lida.
create or replace function public.import_invoice(p_card_id uuid, p_items jsonb)
returns setof public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_ids uuid[];
  v_sum numeric(12,2);
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Nenhum lançamento para importar' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 500 then
    raise exception 'Fatura com lançamentos demais (máx. 500)' using errcode = '22023';
  end if;
  if p_card_id is not null and not exists (select 1 from public.cards where id = p_card_id) then
    raise exception 'Cartão não encontrado' using errcode = 'P0002';
  end if;

  with ins as (
    insert into public.transactions (user_id, card_id, name, category, amount, occurred_at, source)
    select v_uid, p_card_id, i.name, i.category, i.amount, coalesce(i.occurred_at, now()), 'fatura'
      from jsonb_to_recordset(p_items) as i(name text, category public.expense_category, amount numeric, occurred_at timestamptz)
    returning id, amount
  )
  select array_agg(ins.id), coalesce(sum(ins.amount), 0) into v_ids, v_sum from ins;

  update public.profiles set balance = balance - v_sum where id = v_uid;
  if p_card_id is not null then
    update public.cards set invoice = v_sum where id = p_card_id and user_id = v_uid;
  end if;

  return query
    select t.* from public.transactions t where t.id = any (v_ids) order by t.occurred_at desc;
end;
$$;

-- ───────── RPC: guardar valor numa meta (negativo = desfazer) ─────────
create or replace function public.save_to_goal(p_goal_id uuid, p_amount numeric)
returns public.goals
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_goal public.goals;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;
  if p_amount is null or p_amount = 0 then
    raise exception 'Valor inválido' using errcode = '22023';
  end if;

  update public.goals set saved = saved + p_amount where id = p_goal_id returning * into v_goal;
  if not found then
    raise exception 'Meta não encontrada' using errcode = 'P0002';
  end if;

  update public.profiles set balance = balance - p_amount where id = v_uid;
  return v_goal;
end;
$$;

-- ───────── RPC: excluir meta (o valor guardado volta ao saldo) ─────────
-- Devolve a meta apagada, para o "Desfazer" chamar restore_goal.
create or replace function public.delete_goal(p_goal_id uuid)
returns public.goals
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_goal public.goals;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;

  delete from public.goals where id = p_goal_id returning * into v_goal;
  if not found then
    raise exception 'Meta não encontrada' using errcode = 'P0002';
  end if;

  update public.profiles set balance = balance + v_goal.saved where id = v_uid;
  return v_goal;
end;
$$;

-- ───────── RPC: desfazer exclusão de meta (tira de novo do saldo) ─────────
create or replace function public.restore_goal(
  p_id        uuid,
  p_name      text,
  p_target    numeric,
  p_saved     numeric,
  p_due_month date,
  p_position  integer
)
returns public.goals
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_goal public.goals;
begin
  if v_uid is null then
    raise exception 'Sessão obrigatória' using errcode = '42501';
  end if;

  insert into public.goals (id, user_id, name, target, saved, due_month, position)
  values (p_id, v_uid, p_name, p_target, coalesce(p_saved, 0), p_due_month, coalesce(p_position, 0))
  on conflict (id) do nothing
  returning * into v_goal;

  -- já existia: nada muda (igual ao reducer goal/restore)
  if v_goal.id is null then
    return null;
  end if;

  update public.profiles set balance = balance - v_goal.saved where id = v_uid;
  return v_goal;
end;
$$;

-- ───────── RPC (leitura): total gasto por mês ─────────
-- Substitui previousMonthTotal: o app pede os 2 últimos meses e compara.
create or replace function public.monthly_spending(
  p_months integer default 2,
  p_tz     text default 'America/Sao_Paulo'
)
returns table (month date, total numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select (date_trunc('month', t.occurred_at at time zone p_tz))::date as month,
         sum(t.amount)::numeric(12,2) as total
    from public.transactions t
   where t.user_id = (select auth.uid())
     and t.occurred_at >= (date_trunc('month', now() at time zone p_tz)
                           - make_interval(months => greatest(least(coalesce(p_months, 2), 24), 1) - 1)) at time zone p_tz
   group by 1
   order by 1 desc;
$$;

-- ───────── grants das RPCs: só authenticated ─────────
revoke execute on function
  public.add_transaction(text, public.expense_category, numeric, timestamptz, uuid, public.transaction_source, uuid),
  public.update_transaction(uuid, text, public.expense_category, numeric, timestamptz, uuid),
  public.delete_transaction(uuid),
  public.import_invoice(uuid, jsonb),
  public.save_to_goal(uuid, numeric),
  public.delete_goal(uuid),
  public.restore_goal(uuid, text, numeric, numeric, date, integer),
  public.monthly_spending(integer, text)
from public, anon;

grant execute on function
  public.add_transaction(text, public.expense_category, numeric, timestamptz, uuid, public.transaction_source, uuid),
  public.update_transaction(uuid, text, public.expense_category, numeric, timestamptz, uuid),
  public.delete_transaction(uuid),
  public.import_invoice(uuid, jsonb),
  public.save_to_goal(uuid, numeric),
  public.delete_goal(uuid),
  public.restore_goal(uuid, text, numeric, numeric, date, integer),
  public.monthly_spending(integer, text)
to authenticated;
