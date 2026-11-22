-- Criar meta com "Já guardado" tira esse valor do saldo, numa transação só.
-- Antes, a meta nascia com `saved` sem mexer no saldo, mas excluir devolvia `saved` ao saldo:
-- o saldo crescia do nada. Agora vale a regra única: tudo o que está numa meta saiu do saldo.

create or replace function public.add_goal(
  p_id uuid,
  p_name text,
  p_target numeric,
  p_saved numeric default 0,
  p_due_month date default null,
  p_position integer default 0
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
  if coalesce(p_saved, 0) < 0 then
    raise exception 'Valor inválido' using errcode = '22023';
  end if;

  insert into public.goals (id, user_id, name, target, saved, due_month, position)
  values (coalesce(p_id, gen_random_uuid()), v_uid, p_name, p_target, coalesce(p_saved, 0), p_due_month, coalesce(p_position, 0))
  returning * into v_goal;

  if coalesce(p_saved, 0) > 0 then
    update public.profiles set balance = balance - p_saved where id = v_uid;
  end if;

  return v_goal;
end;
$$;

revoke execute on function public.add_goal(uuid, text, numeric, numeric, date, integer) from public, anon;
grant execute on function public.add_goal(uuid, text, numeric, numeric, date, integer) to authenticated;
