-- Eskgo · seed da conta demo (ventura@eskgo.app) — espelha src/lib/seed.ts
--
-- Idempotente: pode rodar quantas vezes quiser. Cada execução:
--   1. cria a conta demo no Auth, se ainda não existir (SEM senha: definir no painel);
--   2. APAGA os cartões, gastos, metas e tetos da demo e grava de novo os dados mock.
-- Só toca na conta demo. Nenhuma outra conta é criada ou alterada.
-- As datas são relativas ao dia em que roda (fuso America/Sao_Paulo), como no seed.ts.

do $$
declare
  v_email constant text := 'ventura@eskgo.app';
  v_tz    constant text := 'America/Sao_Paulo';
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_month date := date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date;
  v_prev  date := (date_trunc('month', (now() at time zone 'America/Sao_Paulo')) - interval '1 month')::date;
  v_uid   uuid;
  c_principal uuid;
  c_salario   uuid;
  c_viagem    uuid;
begin
  -- 1. conta demo no Auth (o trigger on_auth_user_created cria profile + budget)
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', v_email, '', now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb, '{"name": "Ventura"}'::jsonb, now(), now(),
      '', '', '', '', '', '', '', '',
      false, false
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now()
    );
  end if;

  -- garante as linhas 1:1 (caso a conta exista de antes do trigger)
  insert into public.profiles (id, name) values (v_uid, 'Ventura') on conflict (id) do nothing;
  insert into public.budgets (user_id) values (v_uid) on conflict (user_id) do nothing;

  -- 2. limpa os dados de app da demo
  delete from public.transactions      where user_id = v_uid;
  delete from public.cards             where user_id = v_uid;
  delete from public.goals             where user_id = v_uid;
  delete from public.budget_categories where user_id = v_uid;

  -- perfil e teto
  update public.profiles set name = 'Ventura', balance = 14500, hide_balance = false, plus = false where id = v_uid;
  update public.budgets  set total = 3200 where user_id = v_uid;
  insert into public.budget_categories (user_id, category, amount) values
    (v_uid, 'Moradia', 1200), (v_uid, 'Alimentação', 1200), (v_uid, 'Transporte', 600),
    (v_uid, 'Lazer', 200), (v_uid, 'Outros', 0);

  -- cartões (ordem na tela = created_at desc). due_day = dia de hoje + dueInDays do seed.ts
  insert into public.cards (user_id, nickname, last4, color, credit_limit, invoice, due_day, created_at)
  values (v_uid, 'Principal', '4552', 'gradient', 3000, 1284, extract(day from v_today + 8)::smallint, now())
  returning id into c_principal;
  insert into public.cards (user_id, nickname, last4, color, credit_limit, invoice, due_day, created_at)
  values (v_uid, 'Salário', '6917', 'champagne', 2000, 640, extract(day from v_today + 12)::smallint, now() - interval '1 minute')
  returning id into c_salario;
  insert into public.cards (user_id, nickname, last4, color, credit_limit, invoice, due_day, created_at)
  values (v_uid, 'Viagem', '1180', 'offwhite', 1500, 98, extract(day from v_today + 27)::smallint, now() - interval '2 minutes')
  returning id into c_viagem;

  -- gastos do mês atual (t1…t12 do seed.ts): dias atrás + hora, sem sair do mês corrente
  insert into public.transactions (user_id, card_id, name, category, amount, occurred_at, source)
  select v_uid,
         case s.card when 'principal' then c_principal when 'salario' then c_salario when 'viagem' then c_viagem end,
         s.name, s.category::public.expense_category, s.amount,
         (greatest(v_today - s.days_ago, v_month) + make_time(s.h, s.m, 0)) at time zone v_tz,
         'manual'
    from (values
      ('Mercado',     'Alimentação', 'principal', 186.40,  0, 14, 20),
      ('Assinaturas', 'Lazer',       'salario',    64.80,  1,  9, 10),
      ('Uber',        'Transporte',  'principal',  32.90,  1,  8, 45),
      ('iFood',       'Alimentação', 'principal',  68.40,  2, 20, 30),
      ('Cinema',      'Lazer',       'principal',  56.00,  3, 19,  0),
      ('Posto',       'Transporte',  'principal', 180.00,  5, 18, 10),
      ('Padaria',     'Alimentação', null,         32.20,  6,  8,  0),
      ('Livraria',    'Lazer',       'viagem',     35.20,  8, 16,  0),
      ('Mercado',     'Alimentação', 'principal', 297.00, 10, 11,  0),
      ('Metrô',       'Transporte',  null,         27.10, 12,  7, 50),
      ('Restaurante', 'Alimentação', 'salario',   160.00, 13, 21,  0),
      ('Aluguel',     'Moradia',     null,       1200.00, 16, 10,  0)
    ) as s(name, category, card, amount, days_ago, h, m);

  -- mês anterior: substitui previousMonthTotal = 2659 do seed.ts (soma = 2.659,00)
  insert into public.transactions (user_id, card_id, name, category, amount, occurred_at, source)
  select v_uid,
         case s.card when 'principal' then c_principal when 'salario' then c_salario end,
         s.name, s.category::public.expense_category, s.amount,
         ((v_prev + (s.dia - 1)) + make_time(s.h, 0, 0)) at time zone v_tz,
         'manual'
    from (values
      ('Assinaturas', 'Lazer',       'salario',    64.80,  2,  9),
      ('Metrô',       'Transporte',  null,         54.20,  3,  8),
      ('Mercado',     'Alimentação', 'principal', 412.30,  6, 11),
      ('Posto',       'Transporte',  'principal', 210.00,  8, 18),
      ('Aluguel',     'Moradia',     null,       1200.00, 10, 10),
      ('Cinema',      'Lazer',       'principal',  62.00, 12, 20),
      ('iFood',       'Alimentação', 'principal', 118.00, 14, 21),
      ('Uber',        'Transporte',  'principal',  96.50, 17,  9),
      ('Mercado',     'Alimentação', 'principal', 356.70, 20, 11),
      ('Restaurante', 'Alimentação', 'salario',    84.50, 25, 21)
    ) as s(name, category, card, amount, dia, h);

  -- metas (ordem = position)
  insert into public.goals (user_id, name, target, saved, due_month, position) values
    (v_uid, 'Viagem ao Japão', 20000, 13600, date '2027-12-01', 0),
    (v_uid, 'Reserva',         10000,  7200, null,              1),
    (v_uid, 'Curso',            3000,  2700, null,              2),
    (v_uid, 'Carro novo',      40000,  9600, null,              3);
end;
$$;
