-- Eskgo · esquema inicial (rascunho para a integração — ainda não aplicado)
-- Espelha src/lib/types.ts. Valores em reais com 2 casas (numeric(12,2)).

create type category as enum ('Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros');
create type card_color as enum ('gradient', 'champagne', 'offwhite');
create type tx_source as enum ('manual', 'fatura');

-- Perfil (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  balance numeric(12,2) not null default 0,
  hide_balance boolean not null default false,
  plus boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nickname text not null,
  last4 char(4) not null check (last4 ~ '^[0-9]{4}$'),
  color card_color not null default 'champagne',
  "limit" numeric(12,2) not null check ("limit" >= 0),
  invoice numeric(12,2) not null default 0,
  due_day smallint check (due_day between 1 and 31),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  card_id uuid references public.cards on delete set null, -- null = dinheiro / pix
  name text not null,
  category category not null,
  amount numeric(12,2) not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  source tx_source not null default 'manual',
  created_at timestamptz not null default now()
);
create index transactions_user_date on public.transactions (user_id, occurred_at desc);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  target numeric(12,2) not null check (target > 0),
  saved numeric(12,2) not null default 0,
  due_month date, -- primeiro dia do mês alvo
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

-- Teto do mês (total + por categoria)
create table public.budgets (
  user_id uuid primary key references auth.users on delete cascade,
  total numeric(12,2) not null default 0,
  by_category jsonb not null default '{}'::jsonb
);

-- RLS: cada pessoa só enxerga o que é dela
alter table public.profiles     enable row level security;
alter table public.cards        enable row level security;
alter table public.transactions enable row level security;
alter table public.goals        enable row level security;
alter table public.budgets      enable row level security;

create policy "own profile"      on public.profiles     for all using (id = auth.uid())      with check (id = auth.uid());
create policy "own cards"        on public.cards        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own transactions" on public.transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own goals"        on public.goals        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own budget"       on public.budgets      for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cria o perfil quando alguém se cadastra
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.budgets (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
