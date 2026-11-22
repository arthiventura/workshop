-- Eskgo · 1/5 · esquema: tipos, tabelas, constraints e índices
-- Fonte da verdade do banco. Documentação: docs/banco/README.md

-- ───────── tipos ─────────
create type public.expense_category as enum ('Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros');
create type public.card_color as enum ('gradient', 'champagne', 'offwhite');
create type public.transaction_source as enum ('manual', 'fatura');

-- ───────── perfil (1:1 com auth.users) ─────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null default '' check (char_length(name) <= 80),
  balance      numeric(12,2) not null default 0,
  hide_balance boolean not null default false,
  plus         boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is 'Perfil do app (1:1 com auth.users). Criado pelo trigger on_auth_user_created.';
comment on column public.profiles.balance is 'Saldo da pessoa. Muda pelas RPCs de gasto e de meta.';
comment on column public.profiles.plus is 'Eskgo Plus (estágio 2: Fatura + Assistente).';

-- ───────── cartões ─────────
create table public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  nickname     text not null check (char_length(btrim(nickname)) between 1 and 40),
  last4        text not null check (last4 ~ '^[0-9]{4}$'),
  color        public.card_color not null default 'champagne',
  credit_limit numeric(12,2) not null check (credit_limit >= 0),
  invoice      numeric(12,2) not null default 0 check (invoice >= 0),
  due_day      smallint not null check (due_day between 1 and 31),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- alvo da FK composta de transactions: garante que o gasto e o cartão são da mesma pessoa
  constraint cards_id_user_id_key unique (id, user_id)
);
comment on column public.cards.invoice is 'Fatura atual do cartão.';
comment on column public.cards.due_day is 'Dia do mês em que a fatura vence (1–31). O app calcula dueInDays a partir dele.';
create index cards_user_id_created_at_idx on public.cards (user_id, created_at desc);

-- ───────── gastos ─────────
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  card_id     uuid, -- null = Dinheiro / Pix
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  category    public.expense_category not null,
  amount      numeric(12,2) not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  source      public.transaction_source not null default 'manual',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- excluir o cartão mantém o gasto como "Dinheiro / Pix": zera só card_id (Postgres 15+)
  constraint transactions_card_fkey foreign key (card_id, user_id)
    references public.cards (id, user_id) on delete set null (card_id)
);
comment on column public.transactions.amount is 'Valor positivo; o app exibe com "−".';
create index transactions_user_id_occurred_at_idx on public.transactions (user_id, occurred_at desc);
create index transactions_card_id_user_id_idx on public.transactions (card_id, user_id);

-- ───────── metas ─────────
create table public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  target     numeric(12,2) not null check (target > 0),
  saved      numeric(12,2) not null default 0 check (saved >= 0),
  due_month  date check (due_month = date_trunc('month', due_month)::date),
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.goals.due_month is 'Primeiro dia do mês alvo ("Dez 2027" = 2027-12-01). Opcional.';
comment on column public.goals.position is 'Ordem na tela de Metas (crescente).';
create index goals_user_id_position_idx on public.goals (user_id, position);

-- ───────── teto do mês ─────────
create table public.budgets (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  total      numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.budgets is 'Teto total do mês (vale para todos os meses). Criado pelo trigger on_auth_user_created.';

create table public.budget_categories (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  category   public.expense_category not null,
  amount     numeric(12,2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);
comment on table public.budget_categories is 'Teto por categoria. Categoria sem linha = teto 0.';
